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
  localeNames,
  message,
  editorLabels,
  previewLabels,
  onChange,
}: LocalizedWidgetProps) {
  const enPath = `${field.path}.en`;
  const viPath = `${field.path}.vi`;
  const enLabel = `${label} (${localeNames.en})`;
  const viLabel = `${label} (${localeNames.vi})`;
  const viStatus = (
    <span
      aria-hidden
      className={value.vi ? 'bg-success size-1.5 rounded-full' : 'bg-warning size-1.5 rounded-full'}
    />
  );

  return (
    <Field>
      {field.kind === 'markdown' ? (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <span className="text-sm font-medium">{enLabel}</span>
            <MarkdownField
              ariaLabel={enLabel}
              value={value.en ?? ''}
              onChange={(markdown) => onChange('en', markdown)}
              labels={editorLabels}
              previewLabels={previewLabels}
              readOnly={readOnly}
              variant="compact"
            />
          </div>
          <div className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              {viLabel}
              {viStatus}
            </span>
            <MarkdownField
              ariaLabel={viLabel}
              value={value.vi ?? ''}
              onChange={(markdown) => onChange('vi', markdown)}
              labels={editorLabels}
              previewLabels={previewLabels}
              readOnly={readOnly}
              variant="compact"
            />
          </div>
        </div>
      ) : field.kind === 'localized-textarea' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel htmlFor={enPath}>{enLabel}</FieldLabel>
            <Textarea
              id={enPath}
              value={value.en ?? ''}
              disabled={readOnly}
              onChange={(event) => onChange('en', event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor={viPath} className="flex items-center gap-2">
              {viLabel}
              {viStatus}
            </FieldLabel>
            <Textarea
              id={viPath}
              value={value.vi ?? ''}
              disabled={readOnly}
              onChange={(event) => onChange('vi', event.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel htmlFor={enPath}>{enLabel}</FieldLabel>
            <Input
              id={enPath}
              value={value.en ?? ''}
              disabled={readOnly}
              onChange={(event) => onChange('en', event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor={viPath} className="flex items-center gap-2">
              {viLabel}
              {viStatus}
            </FieldLabel>
            <Input
              id={viPath}
              value={value.vi ?? ''}
              disabled={readOnly}
              onChange={(event) => onChange('vi', event.target.value)}
            />
          </div>
        </div>
      )}
      <FieldError>{message}</FieldError>
    </Field>
  );
}
