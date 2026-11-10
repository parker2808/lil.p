'use client';

import { Field, FieldError, FieldLabel } from '@portfolio/ui/components/ui/field';
import {
  SchemaFieldControl as CoreSchemaFieldControl,
  SchemaForm as CoreSchemaForm,
} from '@parker2808/cms-core/react';
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
      <CoreSchemaForm
        fields={fields}
        renderField={(field) => (
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
                localeLabels={{ en: fieldT('en'), vi: fieldT('vi') }}
                onChange={(next) => api.handleChange(next as never)}
              />
            )}
          </form.Field>
        )}
      />
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
  localeLabels,
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
  localeLabels: { en: string; vi: string };
  onChange: (value: unknown) => void;
}) {
  return (
    <CoreSchemaFieldControl
      field={field}
      value={value}
      issue={issue}
      fieldErrors={fieldErrors}
      label={label}
      readOnly={readOnly}
      onChange={onChange}
      widgets={{
        localized: (control) => {
          const localized = (control.value ?? { en: '', vi: '' }) as { en?: string; vi?: string };
          return (
            <LocalizedWidget
              field={control.field}
              value={localized}
              readOnly={control.readOnly}
              label={control.label}
              message={control.message}
              localeLabels={localeLabels}
              editorLabels={editorLabels}
              previewLabels={previewLabels}
              onChange={(locale, next) => control.onChange({ ...localized, [locale]: next })}
            />
          );
        },
        array: (control) => (
          <Field>
            <FieldLabel htmlFor={control.field.path}>{control.label}</FieldLabel>
            <ArrayWidget {...control} labels={widgetLabels} />
            <FieldError>{control.message}</FieldError>
          </Field>
        ),
        scalar: (control) => (
          <Field>
            <FieldLabel htmlFor={control.field.path}>{control.label}</FieldLabel>
            <ScalarWidget {...control} labels={widgetLabels} />
            <FieldError>{control.message}</FieldError>
          </Field>
        ),
      }}
    />
  );
}
