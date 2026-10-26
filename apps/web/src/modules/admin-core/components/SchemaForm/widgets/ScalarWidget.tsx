'use client';

import { HuePicker } from '@portfolio/ui/components/HuePicker/HuePicker';
import { IconPicker } from '@portfolio/ui/components/IconPicker/IconPicker';
import { Input } from '@portfolio/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import { PUBLIC_ROUTES, type Hue, type IconKey } from '@portfolio/contracts';

import type { ScalarWidgetProps } from './widget.types';

export function ScalarWidget({ field, value, readOnly, onChange, labels }: ScalarWidgetProps) {
  if (field.kind === 'switch') {
    return (
      <Switch
        id={field.path}
        checked={Boolean(value)}
        disabled={readOnly}
        onCheckedChange={(checked) => onChange(checked)}
      />
    );
  }

  if (field.kind === 'number' || field.kind === 'project') {
    return (
      <Input
        id={field.path}
        type="number"
        value={value == null ? '' : String(value)}
        disabled={readOnly}
        onChange={(event) =>
          onChange(event.target.value === '' ? null : Number(event.target.value))
        }
      />
    );
  }

  if (field.kind === 'text' || field.kind === 'tag') {
    return (
      <Input
        id={field.path}
        value={String(value ?? '')}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.kind === 'textarea') {
    return (
      <Textarea
        id={field.path}
        value={String(value ?? '')}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.kind === 'select' || field.kind === 'route') {
    return (
      <Select
        value={String(value ?? '')}
        disabled={readOnly}
        onValueChange={(next) => onChange(next)}
      >
        <SelectTrigger id={field.path}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(field.enum ?? (field.kind === 'route' ? [...PUBLIC_ROUTES] : [])).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.kind === 'icon') {
    if (readOnly) {
      return <Input id={field.path} value={String(value ?? '')} disabled />;
    }
    return (
      <IconPicker
        value={(value as IconKey | undefined) ?? 'sparkles'}
        onChange={(next) => onChange(next)}
        labels={{ open: labels.iconOpen, search: labels.iconSearch, empty: labels.iconEmpty }}
      />
    );
  }

  if (field.kind === 'hue') {
    if (readOnly) {
      return <Input id={field.path} value={String(value ?? '')} disabled />;
    }
    return (
      <HuePicker
        value={(value as Hue | undefined) ?? 'JADE'}
        onChange={(next) => onChange(next)}
        labels={labels.hues}
      />
    );
  }

  return null;
}
