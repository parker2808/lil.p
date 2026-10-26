'use client';

import type { AdminSocialLink } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Switch } from '@portfolio/ui/components/ui/switch';

export function SocialTable({
  items,
  readOnly,
  labels,
  onToggle,
  onMove,
}: {
  items: AdminSocialLink[];
  readOnly: boolean;
  labels: {
    header: string;
    cta: string;
    moveUp: string;
    moveDown: string;
  };
  onToggle: (id: number, field: 'showInHeader' | 'showInCta', value: boolean) => void;
  onMove: (id: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="border-border flex flex-wrap items-center gap-4 rounded-lg border p-3"
        >
          <p className="text-ui min-w-32 font-medium">{item.labelEn}</p>
          <Field className="flex-row items-center gap-2">
            <Switch
              id={`header-${item.id}`}
              checked={item.showInHeader}
              disabled={readOnly}
              onCheckedChange={(checked) => onToggle(item.id, 'showInHeader', checked)}
            />
            <FieldLabel htmlFor={`header-${item.id}`}>{labels.header}</FieldLabel>
          </Field>
          <Field className="flex-row items-center gap-2">
            <Switch
              id={`cta-${item.id}`}
              checked={item.showInCta}
              disabled={readOnly}
              onCheckedChange={(checked) => onToggle(item.id, 'showInCta', checked)}
            />
            <FieldLabel htmlFor={`cta-${item.id}`}>{labels.cta}</FieldLabel>
          </Field>
          {readOnly ? null : (
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => onMove(item.id, -1)}>
                {labels.moveUp}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => onMove(item.id, 1)}>
                {labels.moveDown}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
