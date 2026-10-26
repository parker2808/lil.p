'use client';

import { type AdminProfile, profileUpdateSchema } from '@portfolio/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { EditorShell } from '@/modules/admin-core/components/EditorShell/EditorShell';
import { useAutosave } from '@/modules/admin-core/hooks/use-autosave.hook';
import { useDirtyGuard } from '@/modules/admin-core/hooks/use-dirty-guard.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { editorLabelsFromMessages } from '@/modules/admin-core/utils/editor-labels.util';
import { ApiError } from '@/modules/core/utils/api-error.util';

import { ProfileForm } from '../components/ProfileForm/ProfileForm';
import { useAdminProfile, useSaveAdminProfile } from '../hooks/use-admin-profile.hook';

function toPatch(values: AdminProfile) {
  return {
    displayName: values.displayName,
    legalName: values.legalName,
    city: values.city,
    country: values.country,
    timezone: values.timezone,
    careerStartDate: values.careerStartDate,
    headlineEn: values.headlineEn,
    headlineVi: values.headlineVi,
    subheadlineEn: values.subheadlineEn,
    subheadlineVi: values.subheadlineVi,
    bioEn: values.bioEn,
    bioVi: values.bioVi,
    languagesEn: values.languagesEn,
    languagesVi: values.languagesVi,
    heroKickerEn: values.heroKickerEn,
    heroKickerVi: values.heroKickerVi,
    headlineAccentEn: values.headlineAccentEn,
    headlineAccentVi: values.headlineAccentVi,
    phone: values.phone,
    avatarId: values.avatarId,
    resumeEnId: values.resumeEnId,
    resumeViId: values.resumeViId,
  };
}

export function AdminSiteProfile() {
  const t = useTranslations('admin.profile');
  const existing = useAdminProfile();

  if (existing.isError) {
    return <p className="text-destructive">{t('loadError')}</p>;
  }
  if (!existing.data) {
    return <p>{t('loading')}</p>;
  }

  return <ProfileEditor key={existing.data.updatedAt} initial={existing.data} />;
}

function ProfileEditor({ initial }: { initial: AdminProfile }) {
  const t = useTranslations('admin.profile');
  const editorT = useTranslations('admin.editor');
  const contentT = useTranslations('content');
  const readOnly = !useIsAdmin();
  const save = useSaveAdminProfile();
  const [locale, setLocale] = useState<'en' | 'vi'>('en');
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(toPatch(initial)));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const snapshot = JSON.stringify(toPatch(form));
  const editorLabels = editorLabelsFromMessages((key) => editorT(key, { count: '{count}' }));
  const previewLabels = {
    copy: contentT('copy'),
    copied: contentT('copied'),
    wrap: contentT('wrap'),
    note: contentT('note'),
    warning: contentT('warning'),
    anchor: contentT('anchor'),
  };

  const autosave = useAutosave({
    value: snapshot,
    baseline,
    updatedAt: form.updatedAt,
    enabled: !readOnly,
    storageKey: `editor:profile:${locale}`,
    save: async ({ value }) => {
      const parsed = JSON.parse(value) as ReturnType<typeof toPatch>;
      const checked = profileUpdateSchema.safeParse(parsed);
      if (!checked.success) {
        const next: Record<string, string> = {};
        for (const issue of checked.error.issues) {
          const key = String(issue.path[0] ?? '');
          if (key && !next[key]) {
            next[key] = issue.message;
          }
        }
        setFieldErrors(next);
        throw new ApiError({ status: 400, code: 'VALIDATION_FAILED', message: 'invalid' });
      }
      const result = await save.mutateAsync(checked.data);
      setForm(result);
      setBaseline(JSON.stringify(toPatch(result)));
      setFieldErrors({});
      return { updatedAt: result.updatedAt };
    },
  });

  useDirtyGuard(!readOnly && snapshot !== baseline);

  async function persist() {
    if (readOnly) {
      return;
    }
    const checked = profileUpdateSchema.safeParse(toPatch(form));
    if (!checked.success) {
      const next: Record<string, string> = {};
      for (const issue of checked.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !next[key]) {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }
    await autosave.flush();
  }

  const completeness = useMemo(
    () => ({
      en: Boolean(form.headlineEn.trim()),
      vi: Boolean(form.headlineVi.trim()),
    }),
    [form.headlineEn, form.headlineVi],
  );

  return (
    <EditorShell
      title={t('title')}
      saveStatus={autosave.status === 'dirty' ? 'idle' : autosave.status}
      savedText={autosave.savedAt ? editorT('saved', { seconds: 1 }) : undefined}
      onLoadLatest={() => {
        setForm(initial);
        setBaseline(JSON.stringify(toPatch(initial)));
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
      properties={<p className="text-ui-meta text-muted-foreground">{t('propertiesHint')}</p>}
    >
      <ProfileForm
        values={form}
        locale={locale}
        errors={fieldErrors}
        readOnly={readOnly}
        labels={{
          headline: t('headline'),
          accent: t('accent'),
          kicker: t('kicker'),
          subheadline: t('subheadline'),
          bio: t('bio'),
          careerStart: t('careerStart'),
          languages: t('languages'),
          city: t('city'),
          timezone: t('timezone'),
          phone: t('phone'),
          preview: t('preview'),
          avatar: t('avatar'),
          resumeEn: t('resumeEn'),
          resumeVi: t('resumeVi'),
          choose: t('choose'),
          clear: t('clear'),
          emptyMedia: t('emptyMedia'),
        }}
        editorLabels={editorLabels}
        previewLabels={previewLabels}
        onChange={(name, value) => {
          setForm((current) => ({ ...current, [name]: value }));
          if (String(name).startsWith('headlineAccent')) {
            setFieldErrors((current) => {
              const next = { ...current };
              delete next[String(name)];
              return next;
            });
          }
        }}
        onBlur={() => void persist()}
        onBaseline={(field, markdown) => {
          setForm((current) => ({ ...current, [field]: markdown }));
        }}
      />
    </EditorShell>
  );
}
