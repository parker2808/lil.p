'use client';

import { type AdminTag, adminTagSchema, postCreateSchema, qk } from '@portfolio/contracts';
import { Alert } from '@portfolio/ui/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { EditorShell } from '@/modules/admin-core/components/EditorShell/EditorShell';
import { useAutosave } from '@/modules/admin-core/hooks/use-autosave.hook';
import { useDirtyGuard } from '@/modules/admin-core/hooks/use-dirty-guard.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { editorLabelsFromMessages } from '@/modules/admin-core/utils/editor-labels.util';
import { mapFieldErrors } from '@/modules/admin-core/utils/map-field-errors.util';
import { tagsApi } from '@/modules/admin-taxonomy/services/tags.service';
import { apiClient } from '@/modules/core/services/api-client.service';
import { ApiError } from '@/modules/core/utils/api-error.util';

import { PostContentTab } from '../components/PostContentTab/PostContentTab';
import { PostProperties } from '../components/PostProperties/PostProperties';
import { PostSeoTab } from '../components/PostSeoTab/PostSeoTab';
import { useAdminPost, useCreateAdminPost, useSaveAdminPost } from '../hooks/use-admin-post.hook';
import {
  emptyPostForm,
  postPublishLint,
  postToForm,
  slugifyTitle,
  toPostCreateInput,
  type PostFormValues,
} from '../utils/post-form.util';

export function AdminPostsEditor({ postId }: { postId: number | null }) {
  const t = useTranslations('admin.posts.editor');
  const existing = useAdminPost(postId);

  if (postId !== null && existing.isError) {
    return <p className="text-destructive">{t('loadError')}</p>;
  }
  if (postId !== null && !existing.data) {
    return <p>{t('loading')}</p>;
  }

  return (
    <PostEditorForm
      key={postId ?? 'new'}
      initial={existing.data ? postToForm(existing.data) : emptyPostForm()}
    />
  );
}

function PostEditorForm({ initial }: { initial: PostFormValues }) {
  const t = useTranslations('admin.posts.editor');
  const editorT = useTranslations('admin.editor');
  const contentT = useTranslations('content');
  const router = useRouter();
  const queryClient = useQueryClient();
  const readOnly = !useIsAdmin();
  const create = useCreateAdminPost();
  const save = useSaveAdminPost();
  const [locale, setLocale] = useState<'en' | 'vi'>('en');
  const [tab, setTab] = useState('content');
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(toPostCreateInput(initial)));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const snapshot = JSON.stringify(toPostCreateInput(form));
  const lint = postPublishLint(form);
  const editorLabels = editorLabelsFromMessages((key) => editorT(key, { count: '{count}' }));
  const previewLabels = {
    copy: contentT('copy'),
    copied: contentT('copied'),
    wrap: contentT('wrap'),
    note: contentT('note'),
    warning: contentT('warning'),
    anchor: contentT('anchor'),
  };

  const tags = useQuery({
    queryKey: qk.admin.all('tags'),
    queryFn: async () =>
      z.array(adminTagSchema).parse(await apiClient<AdminTag[]>('/api/admin/tags')),
  });

  const autosave = useAutosave({
    value: snapshot,
    baseline,
    updatedAt: form.updatedAt ?? null,
    enabled: !readOnly && form.id != null,
    storageKey: `editor:post:${form.id ?? 'new'}:${locale}`,
    save: async ({ value, updatedAt }) => {
      const parsed = JSON.parse(value) as PostFormValues;
      const result = await save.mutateAsync({
        id: form.id as number,
        body: { ...parsed, updatedAt: updatedAt ?? undefined },
      });
      const next = postToForm(result);
      setForm(next);
      setBaseline(JSON.stringify(toPostCreateInput(next)));
      return { updatedAt: result.updatedAt };
    },
  });

  useDirtyGuard(!readOnly && snapshot !== baseline);

  function patch<K extends keyof PostFormValues>(name: K, value: PostFormValues[K]) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'titleEn' && !current.id && !current.slug) {
        next.slug = slugifyTitle(String(value));
      }
      return next;
    });
  }

  async function persist() {
    if (readOnly) {
      return;
    }
    if (form.id == null) {
      const parsed = postCreateSchema.safeParse(toPostCreateInput(form));
      if (!parsed.success) {
        if (!form.titleEn.trim()) {
          setFieldErrors({ titleEn: t('titleRequired') });
        }
        return;
      }
      try {
        const created = await create.mutateAsync(parsed.data);
        router.replace(`/admin/posts/${created.id}`);
      } catch (error) {
        if (error instanceof ApiError) {
          setFieldErrors(mapFieldErrors(error));
        }
      }
      return;
    }
    await autosave.flush();
  }

  async function createTag(name: string) {
    if (readOnly) {
      return null;
    }
    const created = await tagsApi.create({ nameEn: name, nameVi: '' });
    queryClient.setQueryData<AdminTag[]>(qk.admin.all('tags'), (current) =>
      current ? [...current, created] : [created],
    );
    return created;
  }

  const completeness = useMemo(
    () => ({
      en: Boolean(form.titleEn.trim() && form.bodyEn.trim()),
      vi: Boolean(form.titleVi.trim() && form.bodyVi.trim()),
    }),
    [form.bodyEn, form.bodyVi, form.titleEn, form.titleVi],
  );

  const bodyWarnings = lint.fieldErrors.bodyEn ?? lint.fieldErrors.bodyVi ?? [];

  return (
    <EditorShell
      title={form.titleEn || t('untitled')}
      saveStatus={autosave.status === 'dirty' ? 'idle' : autosave.status}
      savedText={autosave.savedAt ? editorT('saved', { seconds: 1 }) : undefined}
      onLoadLatest={() => {
        setForm(initial);
        setBaseline(JSON.stringify(toPostCreateInput(initial)));
      }}
      onOverwrite={() => void autosave.overwrite()}
      locale={locale}
      onLocaleChange={(next) => {
        void persist();
        setLocale(next);
      }}
      completeness={completeness}
      labels={{
        readOnly: editorT('readOnly'),
        properties: editorT('properties'),
        saving: editorT('saving'),
        saved: editorT('saved', { seconds: 0 }),
        offline: editorT('offline'),
        conflict: editorT('conflict'),
        loadLatest: editorT('loadLatest'),
        overwrite: editorT('overwrite'),
        localeEn: editorT('localeEn'),
        localeVi: editorT('localeVi'),
      }}
      properties={
        <PostProperties
          values={form}
          tags={tags.data ?? []}
          readOnly={readOnly}
          labels={{
            slug: t('slug'),
            featured: t('featured'),
            cover: t('cover'),
            choose: t('choose'),
            clear: t('clear'),
            emptyMedia: t('emptyMedia'),
            tags: t('tags'),
            openTags: t('openTags'),
            searchTags: t('searchTags'),
            emptyTags: t('emptyTags'),
            createTag: t('createTag', { name: '{name}' }),
            selectedTag: t('selectedTag'),
          }}
          onChange={patch}
          onCreateTag={createTag}
        />
      }
    >
      {bodyWarnings.length > 0 ? (
        <Alert variant="warning" className="mb-4">
          {bodyWarnings[0]}
        </Alert>
      ) : null}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="content">{t('tabs.content')}</TabsTrigger>
          <TabsTrigger value="seo">{t('tabs.seo')}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="pt-4">
          <PostContentTab
            values={form}
            locale={locale}
            errors={fieldErrors}
            warnings={lint.fieldErrors}
            readOnly={readOnly}
            labels={{
              title: t('title'),
              excerpt: t('excerpt'),
              body: t('body'),
              takeaways: t('takeaways'),
              takeawaysCount: t('takeawaysCount', { count: '{count}' }),
            }}
            editorLabels={editorLabels}
            previewLabels={previewLabels}
            onChange={patch}
            onBlur={() => void persist()}
            onBaseline={(field, markdown) => {
              setForm((current) => ({ ...current, [field]: markdown }));
            }}
          />
        </TabsContent>
        <TabsContent value="seo" className="pt-4">
          <PostSeoTab
            values={form}
            locale={locale}
            readOnly={readOnly}
            labels={{ seoTitle: t('seoTitle'), seoDescription: t('seoDescription') }}
            onChange={patch}
          />
        </TabsContent>
      </Tabs>
    </EditorShell>
  );
}
