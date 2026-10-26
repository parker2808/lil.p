import { describe, expect, it } from 'vitest';

import { statsRangeDays, statsRangeWindow } from './dashboard-range.util';

describe('statsRangeWindow', () => {
  it('uses 30 days for the default range', () => {
    const now = new Date('2026-10-26T12:00:00.000Z');
    const window = statsRangeWindow('30d', now);
    expect(statsRangeDays('30d')).toBe(30);
    expect(window.periodEnd.toISOString()).toBe(now.toISOString());
    expect(window.periodStart.toISOString()).toBe('2026-09-26T12:00:00.000Z');
    expect(window.previousStart.toISOString()).toBe('2026-08-27T12:00:00.000Z');
  });

  it('maps 7d and 90d to their day counts', () => {
    expect(statsRangeDays('7d')).toBe(7);
    expect(statsRangeDays('90d')).toBe(90);
  });
});
