'use client';

import { AccentHeadline } from '@portfolio/ui/components/AccentHeadline/AccentHeadline';
import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import type { MarkdownEditorLabels } from '@portfolio/ui/components/MarkdownEditor/types';

import { MarkdownField } from '@/modules/admin-core/components/MarkdownField/MarkdownField';

import type { AdminProfile } from '@portfolio/contracts';

export function ProfileForm({
  values,
  locale,
  errors,
  readOnly,
  labels,
  editorLabels,
  previewLabels,
  onChange,
  onBlur,
  onBaseline,
}: {
  values: AdminProfile;
  locale: 'en' | 'vi';
  errors: Record<string, string>;
  readOnly: boolean;
  labels: {
    headline: string;
    accent: string;
    kicker: string;
    subheadline: string;
    bio: string;
    careerStart: string;
    languages: string;
    city: string;
    timezone: string;
    phone: string;
    preview: string;
  };
  editorLabels: MarkdownEditorLabels;
  previewLabels: {
    copy: string;
    copied: string;
    wrap: string;
    note: string;
    warning: string;
    anchor: string;
  };
  onChange: <K extends keyof AdminProfile>(name: K, value: AdminProfile[K]) => void;
  onBlur: () => void;
  onBaseline: (field: string, markdown: string) => void;
}) {
  const headlineKey = locale === 'en' ? 'headlineEn' : 'headlineVi';
  const accentKey = locale === 'en' ? 'headlineAccentEn' : 'headlineAccentVi';
  const kickerKey = locale === 'en' ? 'heroKickerEn' : 'heroKickerVi';
  const subKey = locale === 'en' ? 'subheadlineEn' : 'subheadlineVi';
  const bioKey = locale === 'en' ? 'bioEn' : 'bioVi';
  const languagesKey = locale === 'en' ? 'languagesEn' : 'languagesVi';
  const headline = values[headlineKey];
  const accent = values[accentKey];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-ui-meta text-muted-foreground mb-2">{labels.preview}</p>
        <AccentHeadline text={headline} accent={accent} as="p" className="text-heading" />
      </div>
      <Field>
        <FieldLabel htmlFor={headlineKey}>{labels.headline}</FieldLabel>
        <Input
          id={headlineKey}
          value={headline}
          disabled={readOnly}
          onChange={(event) => onChange(headlineKey, event.target.value)}
          onBlur={onBlur}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={accentKey}>{labels.accent}</FieldLabel>
        <Input
          id={accentKey}
          value={accent ?? ''}
          disabled={readOnly}
          aria-invalid={Boolean(errors[accentKey])}
          onChange={(event) => onChange(accentKey, event.target.value || null)}
          onBlur={onBlur}
        />
        <FieldError>{errors[accentKey]}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor={kickerKey}>{labels.kicker}</FieldLabel>
        <Input
          id={kickerKey}
          value={values[kickerKey] ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange(kickerKey, event.target.value || null)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={subKey}>{labels.subheadline}</FieldLabel>
        <Textarea
          id={subKey}
          value={values[subKey]}
          disabled={readOnly}
          onChange={(event) => onChange(subKey, event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>{labels.bio}</FieldLabel>
        <MarkdownField
          value={String(values[bioKey] ?? '')}
          onChange={(markdown) => onChange(bioKey, markdown)}
          onBlur={onBlur}
          onBaseline={(markdown) => onBaseline(String(bioKey), markdown)}
          labels={editorLabels}
          previewLabels={previewLabels}
          readOnly={readOnly}
          variant="compact"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="careerStartDate">{labels.careerStart}</FieldLabel>
        <Input
          id="careerStartDate"
          type="date"
          value={values.careerStartDate.slice(0, 10)}
          disabled={readOnly}
          onChange={(event) => onChange('careerStartDate', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={languagesKey}>{labels.languages}</FieldLabel>
        <Input
          id={languagesKey}
          value={values[languagesKey]}
          disabled={readOnly}
          onChange={(event) => onChange(languagesKey, event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="city">{labels.city}</FieldLabel>
        <Input
          id="city"
          value={values.city}
          disabled={readOnly}
          onChange={(event) => onChange('city', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="timezone">{labels.timezone}</FieldLabel>
        <Input
          id="timezone"
          value={values.timezone}
          disabled={readOnly}
          onChange={(event) => onChange('timezone', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="phone">{labels.phone}</FieldLabel>
        <Input
          id="phone"
          value={values.phone ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange('phone', event.target.value || null)}
        />
      </Field>
    </div>
  );
}
