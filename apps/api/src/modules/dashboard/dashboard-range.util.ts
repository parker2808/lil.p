import type { StatsRange } from '@portfolio/contracts';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function statsRangeDays(range: StatsRange): number {
  if (range === '7d') {
    return 7;
  }
  if (range === '90d') {
    return 90;
  }
  return 30;
}

export function statsRangeWindow(
  range: StatsRange,
  now = new Date(),
): {
  days: number;
  periodStart: Date;
  periodEnd: Date;
  previousStart: Date;
} {
  const days = statsRangeDays(range);
  const periodEnd = now;
  const periodStart = new Date(now.getTime() - days * MS_PER_DAY);
  const previousStart = new Date(periodStart.getTime() - days * MS_PER_DAY);
  return { days, periodStart, periodEnd, previousStart };
}
