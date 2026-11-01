'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { MarkdownEditorGroup } from '@portfolio/ui/components/MarkdownEditor/MarkdownEditorGroup';
import type { MarkdownEditorLabels } from '@portfolio/ui/components/MarkdownEditor/types';

import { MarkdownField } from '@/modules/admin-core/components/MarkdownField/MarkdownField';

import type { ProjectFormValues } from '../../utils/project-form.util';

const MARKDOWN_FIELDS = [
  { name: 'problem', hint: false },
  { name: 'constraints', hint: true },
  { name: 'approach', hint: false },
  { name: 'decisions', hint: true },
  { name: 'outcome', hint: false },
  { name: 'lessons', hint: false },
] as const;

export function ProjectContentTab({
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
  values: ProjectFormValues;
  locale: 'en' | 'vi';
  errors: Record<string, string>;
  readOnly: boolean;
  labels: {
    title: string;
    tagline: string;
    headingHint: string;
  } & Record<(typeof MARKDOWN_FIELDS)[number]['name'], string>;
  editorLabels: MarkdownEditorLabels;
  previewLabels: {
    copy: string;
    copied: string;
    wrap: string;
    note: string;
    warning: string;
    anchor: string;
  };
  onChange: <K extends keyof ProjectFormValues>(name: K, value: ProjectFormValues[K]) => void;
  onBlur: () => void;
  onBaseline: (field: string, markdown: string) => void;
}) {
  const titleKey = locale === 'en' ? 'titleEn' : 'titleVi';
  const taglineKey = locale === 'en' ? 'taglineEn' : 'taglineVi';

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor={titleKey}>{labels.title}</FieldLabel>
        <Input
          id={titleKey}
          value={values[titleKey]}
          disabled={readOnly}
          aria-invalid={Boolean(errors[titleKey])}
          onChange={(event) => onChange(titleKey, event.target.value)}
          onBlur={onBlur}
        />
        <FieldError>{errors[titleKey]}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor={taglineKey}>{labels.tagline}</FieldLabel>
        <Input
          id={taglineKey}
          value={values[taglineKey]}
          disabled={readOnly}
          onChange={(event) => onChange(taglineKey, event.target.value)}
          onBlur={onBlur}
        />
      </Field>
      <MarkdownEditorGroup labels={editorLabels}>
        {MARKDOWN_FIELDS.map((field) => {
          const key = `${field.name}${locale === 'en' ? 'En' : 'Vi'}` as keyof ProjectFormValues;
          return (
            <Field key={key}>
              <FieldLabel>{labels[field.name]}</FieldLabel>
              {field.hint ? <FieldDescription>{labels.headingHint}</FieldDescription> : null}
              <MarkdownField
                ariaLabel={labels[field.name]}
                value={String(values[key] ?? '')}
                onChange={(markdown) => onChange(key, markdown)}
                onBlur={onBlur}
                onBaseline={(markdown) => onBaseline(String(key), markdown)}
                labels={editorLabels}
                previewLabels={previewLabels}
                readOnly={readOnly}
              />
            </Field>
          );
        })}
      </MarkdownEditorGroup>
    </div>
  );
}
