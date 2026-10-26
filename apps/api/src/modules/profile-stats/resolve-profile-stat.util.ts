import type { StatSource } from '@portfolio/contracts';

/** Full calendar years from `careerStartDate` to `now` (never negative). */
export function yearsSince(start: Date, now = new Date()): number {
  let years = now.getFullYear() - start.getFullYear();
  const beforeAnniversary =
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate());
  if (beforeAnniversary) {
    years -= 1;
  }
  return Math.max(0, years);
}

export function resolveStatValue({
  source,
  value,
  careerStartDate,
  publishedProjectCount,
  now,
}: {
  source: StatSource;
  value: string | null;
  careerStartDate: Date;
  publishedProjectCount: number;
  now?: Date;
}): string {
  if (source === 'YEARS_COMPUTED') {
    return String(yearsSince(careerStartDate, now));
  }
  if (source === 'PROJECT_COUNT') {
    return String(publishedProjectCount);
  }
  return value ?? '';
}
