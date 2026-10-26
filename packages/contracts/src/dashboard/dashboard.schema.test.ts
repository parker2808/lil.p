import { describe, expect, it } from 'vitest';

import { parseStatsRange, statsQuerySchema } from './dashboard.schema';

describe('stats range', () => {
  it('defaults a missing range to 30d', () => {
    expect(statsQuerySchema.parse({})).toEqual({ range: '30d' });
    expect(parseStatsRange(undefined)).toBe('30d');
    expect(parseStatsRange('1y')).toBe('30d');
  });

  it('keeps a valid range', () => {
    expect(statsQuerySchema.parse({ range: '7d' })).toEqual({ range: '7d' });
    expect(parseStatsRange('90d')).toBe('90d');
  });
});
