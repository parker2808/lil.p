'use client';

import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { Textarea } from '@portfolio/ui/components/ui/textarea';

import { MarkdownField } from '@/modules/admin-core/components/MarkdownField/MarkdownField';

import type { LocalizedWidgetProps } from './widget.types';

export function LocalizedWidget({
  field,
  value,
  readOnly,
  label,
  message,
  editorLabels,
  previewLabels,
  onChange,
}: LocalizedWidgetProps) {
  const enPath = `${field.path}.en`;
  const viPath = `${field.path}.vi`;

  return (
    <Field>
      <div className="flex items-center gap-2">
        <FieldLabel htmlFor={enPath}>{label}</FieldLabel>
        <span
          aria-hidden
          className={
            value.vi ? 'bg-success size-1.5 rounded-full' : 'bg-warning size-1.5 rounded-full'
          }
        />
      </div>
      {field.kind === 'markdown' ? (
        <div className="grid gap-3">
          <MarkdownField
            ariaLabel={`${label} (English)`}
            value={value.en ?? ''}
            onChange={(markdown) => onChange('en', markdown)}
            labels={editorLabels}
            previewLabels={previewLabels}
            readOnly={readOnly}
            variant="compact"
          />
          <MarkdownField
            ariaLabel={`${label} (Vietnamese)`}
            value={value.vi ?? ''}
            onChange={(markdown) => onChange('vi', markdown)}
            labels={editorLabels}
            previewLabels={previewLabels}
            readOnly={readOnly}
            variant="compact"
          />
        </div>
      ) : field.kind === 'localized-textarea' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Textarea
            id={enPath}
            value={value.en ?? ''}
            disabled={readOnly}
            onChange={(event) => onChange('en', event.target.value)}
          />
          <Textarea
            id={viPath}
            value={value.vi ?? ''}
            disabled={readOnly}
            onChange={(event) => onChange('vi', event.target.value)}
          />
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            id={enPath}
            value={value.en ?? ''}
            disabled={readOnly}
            onChange={(event) => onChange('en', event.target.value)}
          />
          <Input
            id={viPath}
            value={value.vi ?? ''}
            disabled={readOnly}
            onChange={(event) => onChange('vi', event.target.value)}
          />
        </div>
      )}
      <FieldError>{message}</FieldError>
    </Field>
  );
}
