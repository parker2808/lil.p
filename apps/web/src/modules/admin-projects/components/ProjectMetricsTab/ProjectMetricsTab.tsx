'use client';

import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';

import type { ProjectFormValues } from '../../utils/project-form.util';

export function ProjectMetricsTab({
  values,
  readOnly,
  labels,
  onChange,
}: {
  values: ProjectFormValues;
  readOnly: boolean;
  labels: {
    add: string;
    remove: string;
    moveUp: string;
    moveDown: string;
    labelEn: string;
    labelVi: string;
    before: string;
    after: string;
    value: string;
  };
  onChange: (metrics: ProjectFormValues['metrics']) => void;
}) {
  const metrics = values.metrics ?? [];

  function update(index: number, patch: Partial<(typeof metrics)[number]>) {
    onChange(
      metrics.map((metric, current) => (current === index ? { ...metric, ...patch } : metric)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= metrics.length) {
      return;
    }
    const copy = [...metrics];
    const current = copy[index];
    const swap = copy[next];
    if (!current || !swap) {
      return;
    }
    copy[index] = swap;
    copy[next] = current;
    onChange(copy.map((metric, sortOrder) => ({ ...metric, sortOrder })));
  }

  return (
    <div className="flex flex-col gap-4">
      {readOnly ? null : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            onChange([
              ...metrics,
              {
                labelEn: '',
                labelVi: '',
                before: null,
                after: null,
                value: '',
                sortOrder: metrics.length,
              },
            ])
          }
        >
          {labels.add}
        </Button>
      )}
      {metrics.map((metric, index) => (
        <div
          key={`${metric.labelEn}-${index}`}
          className="border-border grid gap-3 rounded-lg border p-3"
        >
          <Field>
            <FieldLabel>{labels.labelEn}</FieldLabel>
            <Input
              value={metric.labelEn}
              disabled={readOnly}
              onChange={(event) => update(index, { labelEn: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>{labels.labelVi}</FieldLabel>
            <Input
              value={metric.labelVi}
              disabled={readOnly}
              onChange={(event) => update(index, { labelVi: event.target.value })}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field>
              <FieldLabel>{labels.before}</FieldLabel>
              <Input
                value={metric.before ?? ''}
                disabled={readOnly}
                onChange={(event) => update(index, { before: event.target.value || null })}
              />
            </Field>
            <Field>
              <FieldLabel>{labels.after}</FieldLabel>
              <Input
                value={metric.after ?? ''}
                disabled={readOnly}
                onChange={(event) => update(index, { after: event.target.value || null })}
              />
            </Field>
            <Field>
              <FieldLabel>{labels.value}</FieldLabel>
              <Input
                value={metric.value}
                disabled={readOnly}
                onChange={(event) => update(index, { value: event.target.value })}
              />
            </Field>
          </div>
          {readOnly ? null : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => move(index, -1)}>
                {labels.moveUp}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => move(index, 1)}>
                {labels.moveDown}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(metrics.filter((_, current) => current !== index))}
              >
                {labels.remove}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
