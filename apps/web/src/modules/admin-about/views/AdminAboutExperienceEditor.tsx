'use client';

import { type AdminSkill, adminSkillSchema, experienceCreateSchema } from '@portfolio/contracts';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { AdminLoadError } from '@/modules/admin-core/components/AdminLoadError/AdminLoadError';
import { EditorShell } from '@/modules/admin-core/components/EditorShell/EditorShell';
import { useAdminBack } from '@/modules/admin-core/hooks/use-admin-back.hook';
import { useAutosave } from '@/modules/admin-core/hooks/use-autosave.hook';
import { useSaveStatus } from '@/modules/admin-core/hooks/use-save-status.hook';
import { useDirtyGuard } from '@/modules/admin-core/hooks/use-dirty-guard.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { editorLabelsFromMessages } from '@/modules/admin-core/utils/editor-labels.util';
import { mapFieldErrors } from '@/modules/admin-core/utils/map-field-errors.util';
import { apiClient } from '@/modules/core/services/api-client.service';
import { ApiError } from '@/modules/core/utils/api-error.util';

import { ExperienceForm } from '../components/ExperienceForm/ExperienceForm';
import {
  useAdminExperienceRow,
  useCreateAdminExperience,
  useSaveAdminExperience,
} from '../hooks/use-admin-experience-editor.hook';
import {
  emptyExperienceForm,
  experienceToForm,
  toExperienceCreateInput,
  type ExperienceFormValues,
} from '../utils/experience-form.util';

export function AdminAboutExperienceEditor({ experienceId }: { experienceId: number | null }) {
  const t = useTranslations('admin.experience.editor');
  const existing = useAdminExperienceRow(experienceId);

  if (experienceId !== null && existing.isError) {
    return (
      <AdminLoadError
        navKey="experience"
        message={t('loadError')}
        onRetry={() => void existing.refetch()}
      />
    );
  }
  if (experienceId !== null && !existing.data) {
    return <p>{t('loading')}</p>;
  }

  return (
    <ExperienceEditorForm
      key={experienceId ?? 'new'}
      initial={existing.data ? experienceToForm(existing.data) : emptyExperienceForm()}
    />
  );
}

function ExperienceEditorForm({ initial }: { initial: ExperienceFormValues }) {
  const t = useTranslations('admin.experience.editor');
  const editorT = useTranslations('admin.editor');
  const contentT = useTranslations('content');
  const back = useAdminBack('experience');
  const router = useRouter();
  const readOnly = !useIsAdmin();
  const create = useCreateAdminExperience();
  const save = useSaveAdminExperience();
  const [locale, setLocale] = useState<'en' | 'vi'>('en');
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(toExperienceCreateInput(initial)));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const snapshot = JSON.stringify(toExperienceCreateInput(form));
  const editorLabels = editorLabelsFromMessages((key) => editorT(key, { count: '{count}' }));
  const previewLabels = {
    copy: contentT('copy'),
    copied: contentT('copied'),
    wrap: contentT('wrap'),
    note: contentT('note'),
    warning: contentT('warning'),
    anchor: contentT('anchor'),
  };

  const skills = useQuery({
    queryKey: ['admin', 'skills'],
    queryFn: async () =>
      z.array(adminSkillSchema).parse(await apiClient<AdminSkill[]>('/api/admin/skills')),
  });

  const autosave = useAutosave({
    value: snapshot,
    baseline,
    updatedAt: form.updatedAt ?? null,
    enabled: !readOnly && form.id != null,
    storageKey: `editor:experience:${form.id ?? 'new'}:${locale}`,
    save: async ({ value, updatedAt }) => {
      const parsed = JSON.parse(value) as ExperienceFormValues;
      const result = await save.mutateAsync({
        id: form.id as number,
        body: { ...parsed, updatedAt: updatedAt ?? undefined },
      });
      const next = experienceToForm(result);
      setForm(next);
      setBaseline(JSON.stringify(toExperienceCreateInput(next)));
      return { updatedAt: result.updatedAt };
    },
  });
  const saveStatus = useSaveStatus(autosave);

  useDirtyGuard(!readOnly && snapshot !== baseline);

  function patch<K extends keyof ExperienceFormValues>(name: K, value: ExperienceFormValues[K]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function persist() {
    if (readOnly) {
      return;
    }
    if (form.id == null) {
      const parsed = experienceCreateSchema.safeParse(toExperienceCreateInput(form));
      if (!parsed.success) {
        setFieldErrors({ company: t('companyRequired') });
        return;
      }
      try {
        const created = await create.mutateAsync(parsed.data);
        router.replace(`/admin/experience/${created.id}`);
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
      en: Boolean(form.roleEn.trim()),
      vi: Boolean(form.roleVi.trim()),
    }),
    [form.roleEn, form.roleVi],
  );

  return (
    <EditorShell
      title={form.company || t('untitled')}
      back={back}
      saveStatus={saveStatus.state}
      savedText={saveStatus.text}
      onLoadLatest={() => {
        setForm(initial);
        setBaseline(JSON.stringify(toExperienceCreateInput(initial)));
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
        saved: editorT('saved'),
        offline: editorT('offline'),
        conflict: editorT('conflict'),
        loadLatest: editorT('loadLatest'),
        overwrite: editorT('overwrite'),
        localeEn: editorT('localeEn'),
        localeVi: editorT('localeVi'),
      }}
      properties={<p className="text-muted-foreground text-ui-meta">{t('propertiesHint')}</p>}
    >
      <ExperienceForm
        values={form}
        locale={locale}
        skills={skills.data ?? []}
        errors={fieldErrors}
        readOnly={readOnly}
        labels={{
          company: t('company'),
          companyUrl: t('companyUrl'),
          location: t('location'),
          employmentType: t('employmentType'),
          fullTime: t('fullTime'),
          contract: t('contract'),
          freelance: t('freelance'),
          role: t('role'),
          summary: t('summary'),
          highlights: t('highlights'),
          startDate: t('startDate'),
          endDate: t('endDate'),
          visible: t('visible'),
          skills: t('skills'),
        }}
        editorLabels={editorLabels}
        previewLabels={previewLabels}
        onChange={patch}
        onBlur={() => void persist()}
        onBaseline={(field, markdown) => {
          setForm((current) => ({ ...current, [field]: markdown }));
        }}
      />
    </EditorShell>
  );
}
