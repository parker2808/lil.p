'use client';

import { HERO_STAT_LIMITS, type HeroStat, heroStatsSchema } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { FormField } from '@portfolio/ui/components/ui/form-field';
import { IconButton } from '@portfolio/ui/components/ui/icon-button';
import { Input } from '@portfolio/ui/components/ui/input';
import { TooltipProvider } from '@portfolio/ui/components/ui/tooltip';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type HeroStatRow = {
  key: number;
  value: string;
  suffix: string;
  labelEn: string;
  labelVi: string;
};

type HeroStatField = Exclude<keyof HeroStatRow, 'key'>;

const FIELDS: { name: HeroStatField; max: number; required: boolean }[] = [
  { name: 'value', max: HERO_STAT_LIMITS.value, required: true },
  { name: 'suffix', max: HERO_STAT_LIMITS.suffix, required: false },
  { name: 'labelEn', max: HERO_STAT_LIMITS.label, required: true },
  { name: 'labelVi', max: HERO_STAT_LIMITS.label, required: true },
];

let nextKey = 0;

function emptyRow(): HeroStatRow {
  return { key: nextKey++, value: '', suffix: '', labelEn: '', labelVi: '' };
}

export function toHeroStatRows(stats: HeroStat[] | null | undefined): HeroStatRow[] {
  return (stats ?? []).map((stat) => ({ ...emptyRow(), ...stat, suffix: stat.suffix ?? '' }));
}

export function parseHeroStatRows(rows: HeroStatRow[]) {
  return heroStatsSchema.safeParse(
    rows.map(({ value, suffix, labelEn, labelVi }) => ({
      value,
      labelEn,
      labelVi,
      ...(suffix.trim() ? { suffix } : {}),
    })),
  );
}

export function HeroStatsFieldset({
  rows,
  readOnly,
  showErrors,
  onChange,
  onClear,
}: {
  rows: HeroStatRow[];
  readOnly: boolean;
  showErrors: boolean;
  onChange: (rows: HeroStatRow[]) => void;
  onClear: () => void;
}) {
  const t = useTranslations('admin.site.heroStats');
  const parsed = showErrors ? parseHeroStatRows(rows) : null;
  const issues = new Map(
    (parsed?.error?.issues ?? []).map((issue) => [issue.path.join('.'), issue.code]),
  );

  function errorFor(index: number, field: (typeof FIELDS)[number]) {
    const code = issues.get(`${index}.${field.name}`);
    if (code === 'too_small') return t('required');
    if (code === 'too_big') return t('tooLong', { max: field.max });
    return undefined;
  }

  function update(index: number, field: HeroStatField, value: string) {
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function move(index: number, offset: -1 | 1) {
    const next = [...rows];
    const [row] = next.splice(index, 1);
    next.splice(index + offset, 0, row!);
    onChange(next);
  }

  return (
    <TooltipProvider>
      <fieldset className="flex flex-col gap-4 rounded-md border p-4" disabled={readOnly}>
        <legend className="px-1 text-sm font-medium">{t('legend')}</legend>
        <p className="text-ui-meta text-muted-foreground">{t('hint')}</p>
        {rows.map((row, index) => {
          const name = t('row', { index: index + 1 });
          return (
            <div
              key={row.key}
              role="group"
              aria-label={name}
              className="flex flex-col gap-3 border-t pt-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {FIELDS.map((field) => (
                  <FormField
                    key={field.name}
                    label={t(field.name)}
                    required={field.required}
                    maxLength={field.max}
                    error={errorFor(index, field)}
                  >
                    <Input
                      id={`hero-stat-${index}-${field.name}`}
                      value={row[field.name]}
                      onChange={(event) => update(index, field.name, event.target.value)}
                    />
                  </FormField>
                ))}
              </div>
              {readOnly ? null : (
                <div className="flex gap-1">
                  <IconButton
                    type="button"
                    variant="ghost"
                    label={t('moveUp', { index: index + 1 })}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton
                    type="button"
                    variant="ghost"
                    label={t('moveDown', { index: index + 1 })}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton
                    type="button"
                    variant="ghost"
                    label={t('remove', { index: index + 1 })}
                    onClick={() => onChange(rows.filter((_, i) => i !== index))}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </IconButton>
                </div>
              )}
            </div>
          );
        })}
        {readOnly ? null : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={rows.length >= HERO_STAT_LIMITS.items}
              onClick={() => onChange([...rows, emptyRow()])}
            >
              <Plus aria-hidden className="size-4" />
              {t('add')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onClear}>
              {t('clear')}
            </Button>
          </div>
        )}
      </fieldset>
    </TooltipProvider>
  );
}
