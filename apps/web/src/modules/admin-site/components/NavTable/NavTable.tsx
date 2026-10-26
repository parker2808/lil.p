'use client';

import { type AdminNavItem, PUBLIC_ROUTES } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { Input } from '@portfolio/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';

export function NavTable({
  items,
  readOnly,
  labels,
  onLabelChange,
  onHrefChange,
  onMove,
}: {
  items: AdminNavItem[];
  readOnly: boolean;
  labels: {
    label: string;
    href: string;
    custom: string;
    moveUp: string;
    moveDown: string;
  };
  onLabelChange: (id: number, labelEn: string) => void;
  onHrefChange: (id: number, href: string) => void;
  onMove: (id: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const known = (PUBLIC_ROUTES as readonly string[]).includes(item.href);
        return (
          <div
            key={item.id}
            className="border-border grid gap-2 rounded-lg border p-3 sm:grid-cols-3"
          >
            <Input
              aria-label={labels.label}
              value={item.labelEn}
              disabled={readOnly}
              onChange={(event) => onLabelChange(item.id, event.target.value)}
            />
            <Select
              value={known ? item.href : 'custom'}
              disabled={readOnly}
              onValueChange={(value) => {
                if (value !== 'custom') {
                  onHrefChange(item.id, value);
                }
              }}
            >
              <SelectTrigger aria-label={labels.href}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PUBLIC_ROUTES.map((href) => (
                  <SelectItem key={href} value={href}>
                    {href}
                  </SelectItem>
                ))}
                <SelectItem value="custom">{labels.custom}</SelectItem>
              </SelectContent>
            </Select>
            {known ? null : (
              <Input
                aria-label={labels.custom}
                value={item.href}
                disabled={readOnly}
                onChange={(event) => onHrefChange(item.id, event.target.value)}
              />
            )}
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
        );
      })}
    </div>
  );
}
