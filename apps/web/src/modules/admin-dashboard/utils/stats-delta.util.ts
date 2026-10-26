import type { StatsRange } from '@portfolio/contracts';

export type StatsDeltaDirection = 'up' | 'down' | 'flat';

export function statsDelta(
  current: number,
  previous: number,
): {
  direction: StatsDeltaDirection;
  amount: number;
} {
  const amount = current - previous;
  if (amount > 0) {
    return { direction: 'up', amount };
  }
  if (amount < 0) {
    return { direction: 'down', amount: Math.abs(amount) };
  }
  return { direction: 'flat', amount: 0 };
}

export function formatCount(value: number): string {
  return value.toLocaleString('en');
}

export function rangeHref(range: StatsRange): string {
  return range === '30d' ? '/admin' : `/admin?range=${range}`;
}
