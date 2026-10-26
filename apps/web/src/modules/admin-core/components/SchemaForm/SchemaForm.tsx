'use client';

import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import { useForm } from '@tanstack/react-form';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ZodType } from 'zod';

import { editorLabelsFromMessages } from '@/modules/admin-core/utils/editor-labels.util';
import { schemaToFields, type SchemaField } from '@/modules/admin-core/utils/schema-to-fields.util';

import { ArrayWidget } from './widgets/ArrayWidget';
import { LocalizedWidget } from './widgets/LocalizedWidget';
import { ScalarWidget } from './widgets/ScalarWidget';
import type { PreviewLabels, WidgetLabels } from './widgets/widget.types';

function firstIssueMessage(issue: unknown): string {
  if (typeof issue === 'string') {
    return issue;
  }
  if (issue && typeof issue === 'object' && 'message' in issue) {
    return String((issue as { message: unknown }).message);
  }
  return '';
}

export function SchemaForm({
  schema,
  defaultValues,
  fieldErrors,
  readOnly,
  onValuesChange,
}: {
  schema: ZodType;
  defaultValues: Record<string, unknown>;
  fieldErrors?: Record<string, string>;
  readOnly?: boolean;
  onValuesChange?: (values: Record<string, unknown>) => void;
}) {
  const t = useTranslations();
  const editorT = useTranslations('admin.editor');
  const contentT = useTranslations('content');
  const fieldT = useTranslations('admin.blocks.field');
  const iconT = useTranslations('admin.pickers.icon');
  const hueT = useTranslations('admin.pickers.hue');
  const fields = useMemo(() => schemaToFields(schema), [schema]);
  const form = useForm({
    defaultValues,
    validators: { onChange: schema as never },
  });
  const last = useRef<string>('');
  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    function sync(values: Record<string, unknown>) {
      const next = JSON.stringify(values);
      if (next !== last.current) {
        last.current = next;
        onValuesChange?.(values);
      }
      const parsed = schema.safeParse(values);
      const errors: Record<string, string> = {};
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const key = issue.path.join('.');
          if (key && !errors[key]) {
            errors[key] = issue.message;
          }
        }
      }
      setZodErrors(errors);
    }
    sync(form.store.state.values as Record<string, unknown>);
    const unsubscribe = form.store.subscribe(() => {
      sync(form.store.state.values as Record<string, unknown>);
    });
    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, [form.store, onValuesChange, schema]);

  const editorLabels = editorLabelsFromMessages((key) => editorT(key, { count: '{count}' }));
  const previewLabels: PreviewLabels = {
    copy: contentT('copy'),
    copied: contentT('copied'),
    wrap: contentT('wrap'),
    note: contentT('note'),
    warning: contentT('warning'),
    anchor: contentT('anchor'),
  };
  const widgetLabels: WidgetLabels = {
    add: fieldT('add'),
    remove: fieldT('remove'),
    moveUp: fieldT('moveUp'),
    moveDown: fieldT('moveDown'),
    iconOpen: iconT('open'),
    iconSearch: iconT('search'),
    iconEmpty: iconT('empty'),
    hues: {
      JADE: hueT('JADE'),
      AMBER: hueT('AMBER'),
      BLUE: hueT('BLUE'),
      VIOLET: hueT('VIOLET'),
      ROSE: hueT('ROSE'),
    },
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <form.Field key={field.path} name={field.path as never}>
          {(api) => (
            <SchemaFieldControl
              field={field}
              value={api.state.value}
              issue={api.state.meta.errors[0]}
              readOnly={Boolean(readOnly)}
              fieldErrors={{ ...zodErrors, ...fieldErrors }}
              label={t.has(field.label) ? t(field.label) : field.label}
              editorLabels={editorLabels}
              previewLabels={previewLabels}
              widgetLabels={widgetLabels}
              onChange={(next) => api.handleChange(next as never)}
            />
          )}
        </form.Field>
      ))}
    </div>
  );
}

function SchemaFieldControl({
  field,
  value,
  issue,
  readOnly,
  fieldErrors,
  label,
  editorLabels,
  previewLabels,
  widgetLabels,
  onChange,
}: {
  field: SchemaField;
  value: unknown;
  issue: unknown;
  readOnly: boolean;
  fieldErrors: Record<string, string>;
  label: string;
  editorLabels: ReturnType<typeof editorLabelsFromMessages>;
  previewLabels: PreviewLabels;
  widgetLabels: WidgetLabels;
  onChange: (value: unknown) => void;
}) {
  const serverError =
    fieldErrors[field.path] ??
    fieldErrors[`props.${field.path}`] ??
    fieldErrors[`${field.path}.en`] ??
    fieldErrors[`props.${field.path}.en`];
  const message = serverError ?? firstIssueMessage(issue);

  if (
    field.kind === 'localized-text' ||
    field.kind === 'localized-textarea' ||
    field.kind === 'markdown'
  ) {
    const localized = (value ?? { en: '', vi: '' }) as { en?: string; vi?: string };
    return (
      <LocalizedWidget
        field={field}
        value={localized}
        readOnly={readOnly}
        label={label}
        message={message}
        editorLabels={editorLabels}
        previewLabels={previewLabels}
        onChange={(locale, next) => onChange({ ...localized, [locale]: next })}
      />
    );
  }

  return (
    <Field>
      <FieldLabel htmlFor={field.path}>{label}</FieldLabel>
      {field.kind === 'array' || field.kind === 'projects' || field.kind === 'stats' ? (
        <ArrayWidget
          field={field}
          value={value}
          readOnly={readOnly}
          onChange={onChange}
          labels={widgetLabels}
        />
      ) : (
        <ScalarWidget
          field={field}
          value={value}
          readOnly={readOnly}
          onChange={onChange}
          labels={widgetLabels}
        />
      )}
      <FieldError>{message}</FieldError>
    </Field>
  );
}
