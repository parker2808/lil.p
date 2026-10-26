import { describe, expect, it } from 'vitest';

import { parseStatValue } from './parse-stat-value.util';

describe('parseStatValue', () => {
  it('reads a leading number and keeps the suffix', () => {
    expect(parseStatValue('5', '+')).toEqual({ amount: 5, display: '5+' });
    expect(parseStatValue('n/a', null)).toEqual({ amount: null, display: 'n/a' });
  });
});
