import { describe, expect, it } from 'vitest';

import { formatCount, rangeHref, statsDelta } from './stats-delta.util';

describe('statsDelta', () => {
  it('labels an increase, a drop, and a flat period', () => {
    expect(statsDelta(2, 0)).toEqual({ direction: 'up', amount: 2 });
    expect(statsDelta(1, 3)).toEqual({ direction: 'down', amount: 2 });
    expect(statsDelta(0, 0)).toEqual({ direction: 'flat', amount: 0 });
  });

  it('keeps the default range out of the URL', () => {
    expect(rangeHref('30d')).toBe('/admin');
    expect(rangeHref('7d')).toBe('/admin?range=7d');
  });

  it('formats counts with grouping', () => {
    expect(formatCount(2140)).toBe('2,140');
  });
});
