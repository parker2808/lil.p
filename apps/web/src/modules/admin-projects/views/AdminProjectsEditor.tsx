'use client';

import {
  type AdminDomain,
  adminDomainSchema,
  type AdminSkill,
  adminSkillSchema,
  projectCreateSchema,
} from '@portfolio/contracts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { listAdminExperience } from '@/modules/admin-about/services/experience.service';
import { EditorShell } from '@/modules/admin-core/components/EditorShell/EditorShell';
import { useAutosave } from '@/modules/admin-core/hooks/use-autosave.hook';
import { useDirtyGuard } from '@/modules/admin-core/hooks/use-dirty-guard.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { editorLabelsFromMessages } from '@/modules/admin-core/utils/editor-labels.util';
import { mapFieldErrors } from '@/modules/admin-core/utils/map-field-errors.util';
import { apiClient } from '@/modules/core/services/api-client.service';
import { ApiError } from '@/modules/core/utils/api-error.util';

import { ProjectCardFactsTab } from '../components/ProjectCardFactsTab/ProjectCardFactsTab';
import { ProjectContentTab } from '../components/ProjectContentTab/ProjectContentTab';
import { ProjectMetricsTab } from '../components/ProjectMetricsTab/ProjectMetricsTab';
import { ProjectProperties } from '../components/ProjectProperties/ProjectProperties';
import { ProjectSeoTab } from '../components/ProjectSeoTab/ProjectSeoTab';
import {
  useAdminProject,
  useCreateAdminProject,
  useSaveAdminProject,
} from '../hooks/use-admin-project.hook';
import {
  emptyProjectForm,
  projectToForm,
  slugifyTitle,
  toCreateInput,
  type ProjectFormValues,
} from '../utils/project-form.util';

export function AdminProjectsEditor({ projectId }: { projectId: number | null }) {
  const t = useTranslations('admin.projects.editor');
  const existing = useAdminProject(projectId);

  if (projectId !== null && existing.isError) {
    return <p className="text-destructive">{t('loadError')}</p>;
  }
  if (projectId !== null && !existing.data) {
    return <p>{t('loading')}</p>;
  }

  return (
    <ProjectEditorForm
      key={projectId ?? 'new'}
      initial={existing.data ? projectToForm(existing.data) : emptyProjectForm()}
    />
  );
}

function ProjectEditorForm({ initial }: { initial: ProjectFormValues }) {
  const t = useTranslations('admin.projects.editor');
  const statusT = useTranslations('admin.projects.status');
  const editorT = useTranslations('admin.editor');
  const contentT = useTranslations('content');
  const router = useRouter();
  const readOnly = !useIsAdmin();
  const create = useCreateAdminProject();
  const save = useSaveAdminProject();
  const [locale, setLocale] = useState<'en' | 'vi'>('en');
  const [tab, setTab] = useState('content');
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(toCreateInput(initial)));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const snapshot = JSON.stringify(toCreateInput(form));
  const editorLabels = editorLabelsFromMessages((key) => editorT(key, { count: '{count}' }));
  const previewLabels = {
    copy: contentT('copy'),
    copied: contentT('copied'),
    wrap: contentT('wrap'),
    note: contentT('note'),
    warning: contentT('warning'),
    anchor: contentT('anchor'),
  };

  const domains = useQuery({
    queryKey: ['admin', 'domains'],
    queryFn: async () =>
      z.array(adminDomainSchema).parse(await apiClient<AdminDomain[]>('/api/admin/domains')),
  });
  const skills = useQuery({
    queryKey: ['admin', 'skills'],
    queryFn: async () =>
      z.array(adminSkillSchema).parse(await apiClient<AdminSkill[]>('/api/admin/skills')),
  });
  const experience = useQuery({
    queryKey: ['admin', 'experience', 'editor'],
    queryFn: () =>
      listAdminExperience({ page: 1, pageSize: 100, sort: '-startDate' }).then(
        (page) => page.items,
      ),
  });

  const autosave = useAutosave({
    value: snapshot,
    baseline,
    updatedAt: form.updatedAt ?? null,
    enabled: !readOnly && form.id != null,
    storageKey: `editor:project:${form.id ?? 'new'}:${locale}`,
    save: async ({ value, updatedAt }) => {
      const parsed = JSON.parse(value) as ProjectFormValues;
      const result = await save.mutateAsync({
        id: form.id as number,
        body: { ...parsed, updatedAt: updatedAt ?? undefined },
      });
      const next = projectToForm(result);
      setForm(next);
      setBaseline(JSON.stringify(toCreateInput(next)));
      return { updatedAt: result.updatedAt };
    },
  });

  useDirtyGuard(!readOnly && snapshot !== baseline);

  function patch<K extends keyof ProjectFormValues>(name: K, value: ProjectFormValues[K]) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'titleEn' && !current.id && !current.slug) {
        next.slug = slugifyTitle(String(value));
      }
      return next;
    });
    if (name === 'titleEn') {
      setFieldErrors((current) => {
        const rest = { ...current };
        delete rest.titleEn;
        return rest;
      });
    }
  }

  async function persist() {
    if (readOnly) {
      return;
    }
    if (form.id == null) {
      const parsed = projectCreateSchema.safeParse(toCreateInput(form));
      if (!parsed.success) {
        setFieldErrors({ titleEn: t('titleRequired') });
        return;
      }
      try {
        const created = await create.mutateAsync(parsed.data);
        router.replace(`/admin/projects/${created.id}`);
      } catch (error) {
        if (error instanceof ApiError) {
          setFieldErrors(mapFieldErrors(error));
        }
      }
      return;
    }
    await autosave.flush();
  }

  const completeness = useMemo(
    () => ({
      en: Boolean(form.titleEn.trim()),
      vi: Boolean(form.titleVi.trim()),
    }),
    [form.titleEn, form.titleVi],
  );

  return (
    <EditorShell
      title={form.titleEn || t('untitled')}
      saveStatus={autosave.status === 'dirty' ? 'idle' : autosave.status}
      savedText={autosave.savedAt ? editorT('saved', { seconds: 1 }) : undefined}
      onLoadLatest={() => {
        setForm(initial);
        setBaseline(JSON.stringify(toCreateInput(initial)));
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
        <ProjectProperties
          values={form}
          skills={skills.data ?? []}
          experience={experience.data ?? []}
          readOnly={readOnly}
          labels={{
            status: t('status'),
            slug: t('slug'),
            client: t('client'),
            role: t('role'),
            startDate: t('startDate'),
            endDate: t('endDate'),
            featured: t('featured'),
            confidential: t('confidential'),
            experience: t('experience'),
            skills: t('skills'),
            versionFrom: t('versionFrom'),
            versionTo: t('versionTo'),
            liveUrl: t('liveUrl'),
            repoUrl: t('repoUrl'),
            cover: t('cover'),
            gallery: t('gallery'),
            captionEn: t('captionEn'),
            captionVi: t('captionVi'),
            addImage: t('addImage'),
            choose: t('choose'),
            clear: t('clear'),
            emptyMedia: t('emptyMedia'),
            none: t('none'),
            draft: statusT('DRAFT'),
            published: statusT('PUBLISHED'),
            archived: statusT('ARCHIVED'),
          }}
          onChange={patch}
        />
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="content">{t('tabs.content')}</TabsTrigger>
          <TabsTrigger value="card">{t('tabs.card')}</TabsTrigger>
          <TabsTrigger value="metrics">{t('tabs.metrics')}</TabsTrigger>
          <TabsTrigger value="seo">{t('tabs.seo')}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="pt-4">
          <ProjectContentTab
            values={form}
            locale={locale}
            errors={fieldErrors}
            readOnly={readOnly}
            labels={{
              title: t('title'),
              tagline: t('tagline'),
              headingHint: t('headingHint'),
              problem: t('problem'),
              constraints: t('constraints'),
              approach: t('approach'),
              decisions: t('decisions'),
              outcome: t('outcome'),
              lessons: t('lessons'),
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
        <TabsContent value="card" className="pt-4">
          <ProjectCardFactsTab
            values={form}
            locale={locale}
            domains={domains.data ?? []}
            readOnly={readOnly}
            labels={{
              domain: t('domain'),
              none: t('none'),
              keyFacts: t('keyFacts'),
              keyFactsCount: t('keyFactsCount', { count: '{count}' }),
              factChips: t('factChips'),
              factChipsCount: t('factChipsCount', { count: '{count}' }),
              preview: t('preview'),
              nda: t('nda'),
            }}
            onChange={patch}
          />
        </TabsContent>
        <TabsContent value="metrics" className="pt-4">
          <ProjectMetricsTab
            values={form}
            readOnly={readOnly}
            labels={{
              add: t('addMetric'),
              remove: t('removeMetric'),
              moveUp: t('moveUp'),
              moveDown: t('moveDown'),
              labelEn: t('metricLabelEn'),
              labelVi: t('metricLabelVi'),
              before: t('metricBefore'),
              after: t('metricAfter'),
              value: t('metricValue'),
            }}
            onChange={(metrics) => patch('metrics', metrics)}
          />
        </TabsContent>
        <TabsContent value="seo" className="pt-4">
          <ProjectSeoTab
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
