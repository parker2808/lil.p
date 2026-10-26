import type { AdminViews, ViewsByDay } from '@portfolio/contracts';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cursor.getTime() <= last.getTime()) {
    keys.push(utcDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

export function mergeViewsByDay(rows: ViewsByDay[], start: Date, end: Date): ViewsByDay[] {
  const found = new Map(rows.map((row) => [row.date, row]));
  return daysBetween(start, end).map((date) => found.get(date) ?? { date, views: 0, visitors: 0 });
}

export function emptyViews(start: Date, end: Date): AdminViews {
  return {
    total: 0,
    uniqueVisitors: 0,
    previousTotal: 0,
    previousUnique: 0,
    byDay: mergeViewsByDay([], start, end),
    topPages: [],
    topReferrers: [],
  };
}

export function asInt(value: unknown): number {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return Number(value) || 0;
}

export function asDay(value: unknown): string {
  if (value instanceof Date) {
    return utcDateKey(value);
  }
  return String(value).slice(0, 10);
}

export { MS_PER_DAY };
