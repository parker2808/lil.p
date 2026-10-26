import { describe, expect, it } from 'vitest';

import { resolveStatValue, yearsSince } from './resolve-profile-stat.util';

describe('yearsSince', () => {
  it('counts full years after the anniversary', () => {
    expect(yearsSince(new Date(2021, 0, 1), new Date(2026, 9, 26))).toBe(5);
  });

  it('waits until the anniversary day', () => {
    expect(yearsSince(new Date(2021, 0, 1), new Date(2026, 0, 1))).toBe(5);
    expect(yearsSince(new Date(2021, 0, 1), new Date(2025, 11, 31))).toBe(4);
  });

  it('does not go negative', () => {
    expect(yearsSince(new Date(2030, 0, 1), new Date(2026, 0, 1))).toBe(0);
  });
});

describe('resolveStatValue', () => {
  const careerStartDate = new Date(2021, 0, 1);
  const now = new Date(2026, 9, 26);

  it('uses the stored value for MANUAL', () => {
    expect(
      resolveStatValue({
        source: 'MANUAL',
        value: '2',
        careerStartDate,
        publishedProjectCount: 4,
        now,
      }),
    ).toBe('2');
  });

  it('computes years from careerStartDate', () => {
    expect(
      resolveStatValue({
        source: 'YEARS_COMPUTED',
        value: '99',
        careerStartDate,
        publishedProjectCount: 4,
        now,
      }),
    ).toBe('5');
  });

  it('uses the published project count (0 until projects exist)', () => {
    expect(
      resolveStatValue({
        source: 'PROJECT_COUNT',
        value: '4',
        careerStartDate,
        publishedProjectCount: 0,
        now,
      }),
    ).toBe('0');
  });
});
