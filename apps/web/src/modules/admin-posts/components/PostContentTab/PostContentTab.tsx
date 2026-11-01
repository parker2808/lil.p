'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import type { MarkdownEditorLabels } from '@portfolio/ui/components/MarkdownEditor/types';

import { MarkdownField } from '@/modules/admin-core/components/MarkdownField/MarkdownField';

import { clampLines, countLines, type PostFormValues } from '../../utils/post-form.util';

export function PostContentTab({
  values,
  locale,
  errors,
  warnings,
  readOnly,
  labels,
  editorLabels,
  previewLabels,
  onChange,
  onBlur,
  onBaseline,
}: {
  values: PostFormValues;
  locale: 'en' | 'vi';
  errors: Record<string, string>;
  warnings: Record<string, string[]>;
  readOnly: boolean;
  labels: {
    title: string;
    excerpt: string;
    body: string;
    takeaways: string;
    takeawaysCount: string;
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
  onChange: <K extends keyof PostFormValues>(name: K, value: PostFormValues[K]) => void;
  onBlur: () => void;
  onBaseline: (field: string, markdown: string) => void;
}) {
  const titleKey = locale === 'en' ? 'titleEn' : 'titleVi';
  const excerptKey = locale === 'en' ? 'excerptEn' : 'excerptVi';
  const bodyKey = locale === 'en' ? 'bodyEn' : 'bodyVi';
  const takeawaysKey = locale === 'en' ? 'takeawaysEn' : 'takeawaysVi';
  const takeaways = String(values[takeawaysKey] ?? '');

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
        <FieldLabel htmlFor={excerptKey}>{labels.excerpt}</FieldLabel>
        <Textarea
          id={excerptKey}
          rows={3}
          value={values[excerptKey]}
          disabled={readOnly}
          onChange={(event) => onChange(excerptKey, event.target.value)}
        />
        <FieldError>{warnings[excerptKey]?.[0]}</FieldError>
      </Field>
      <Field>
        <FieldLabel>{labels.body}</FieldLabel>
        <MarkdownField
          ariaLabel={labels.body}
          value={String(values[bodyKey] ?? '')}
          onChange={(markdown) => onChange(bodyKey, markdown)}
          onBlur={onBlur}
          onBaseline={(markdown) => onBaseline(String(bodyKey), markdown)}
          labels={editorLabels}
          previewLabels={previewLabels}
          readOnly={readOnly}
          variant="full"
        />
        <FieldError>{warnings[bodyKey]?.[0]}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor={takeawaysKey}>{labels.takeaways}</FieldLabel>
        <Textarea
          id={takeawaysKey}
          rows={5}
          value={takeaways}
          disabled={readOnly}
          onChange={(event) => onChange(takeawaysKey, clampLines(event.target.value, 5))}
        />
        <FieldDescription>
          {labels.takeawaysCount.replace('{count}', String(countLines(takeaways)))}
        </FieldDescription>
      </Field>
    </div>
  );
}
