'use client';

import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { Textarea } from '@portfolio/ui/components/ui/textarea';

import type { PostFormValues } from '../../utils/post-form.util';

export function PostSeoTab({
  values,
  locale,
  readOnly,
  labels,
  onChange,
}: {
  values: PostFormValues;
  locale: 'en' | 'vi';
  readOnly: boolean;
  labels: { seoTitle: string; seoDescription: string };
  onChange: <K extends keyof PostFormValues>(name: K, value: PostFormValues[K]) => void;
}) {
  const titleKey = locale === 'en' ? 'seoTitleEn' : 'seoTitleVi';
  const descriptionKey = locale === 'en' ? 'seoDescriptionEn' : 'seoDescriptionVi';

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor={titleKey}>{labels.seoTitle}</FieldLabel>
        <Input
          id={titleKey}
          value={values[titleKey] ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange(titleKey, event.target.value || null)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={descriptionKey}>{labels.seoDescription}</FieldLabel>
        <Textarea
          id={descriptionKey}
          rows={4}
          value={values[descriptionKey] ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange(descriptionKey, event.target.value || null)}
        />
      </Field>
    </div>
  );
}
