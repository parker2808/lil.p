'use client';

import { Button } from '@portfolio/ui/components/ui/button';
import { Input } from '@portfolio/ui/components/ui/input';

import type { ScalarWidgetProps } from './widget.types';

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function ArrayWidget({ field, value, readOnly, onChange, labels }: ScalarWidgetProps) {
  const items = asList(value);

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= items.length) {
      return;
    }
    const copy = [...items];
    const current = copy[index];
    const swap = copy[next];
    if (current === undefined || swap === undefined) {
      return;
    }
    copy[index] = swap;
    copy[next] = current;
    onChange(copy);
  }

  if (field.kind === 'projects' || field.kind === 'stats') {
    return (
      <Input
        id={field.path}
        value={items.join(',')}
        disabled={readOnly}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(',')
              .map((part) => part.trim())
              .filter(Boolean)
              .map((part) => Number(part) || part),
          )
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {readOnly ? null : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange([...items, field.item?.kind === 'number' ? 0 : ''])}
        >
          {labels.add}
        </Button>
      )}
      {items.map((item, index) => (
        <div key={`${field.path}-${index}`} className="flex items-center gap-2">
          <Input
            id={`${field.path}.${index}`}
            value={item == null ? '' : String(item)}
            disabled={readOnly}
            onChange={(event) => {
              const copy = [...items];
              copy[index] =
                field.item?.kind === 'number'
                  ? event.target.value === ''
                    ? null
                    : Number(event.target.value)
                  : event.target.value;
              onChange(copy);
            }}
          />
          {readOnly ? null : (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                {labels.moveUp}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                {labels.moveDown}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(items.filter((_, current) => current !== index))}
              >
                {labels.remove}
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
