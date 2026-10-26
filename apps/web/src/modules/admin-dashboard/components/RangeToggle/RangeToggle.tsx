'use client';

import { STATS_RANGES, type StatsRange } from '@portfolio/contracts';
import { ToggleGroup, ToggleGroupItem } from '@portfolio/ui/components/ui/toggle-group';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { rangeHref } from '../../utils/stats-delta.util';

export function RangeToggle({
  range,
  hrefFor = rangeHref,
}: {
  range: StatsRange;
  hrefFor?: (next: StatsRange) => string;
}) {
  const t = useTranslations('admin.dashboard.range');
  const router = useRouter();

  return (
    <ToggleGroup
      type="single"
      value={range}
      aria-label={t('label')}
      onValueChange={(next) => {
        if (!next || next === range) {
          return;
        }
        router.replace(hrefFor(next as StatsRange));
      }}
    >
      {STATS_RANGES.map((value) => (
        <ToggleGroupItem key={value} value={value}>
          {t(value)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
