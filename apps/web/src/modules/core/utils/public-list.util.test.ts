import { describe, expect, it } from 'vitest';

import { joinPublicList, splitPublicList } from './public-list.util';

describe('public list formatter', () => {
  it('splits at top-level separators and keeps commas inside parentheses', () => {
    expect(splitPublicList('Vietnamese (native), English (working proficiency)')).toEqual([
      'Vietnamese (native)',
      'English (working proficiency)',
    ]);
    expect(splitPublicList('Vue · Nuxt; TypeScript')).toEqual(['Vue', 'Nuxt', 'TypeScript']);
  });

  it('drops empty and TODO items', () => {
    expect(splitPublicList('Vietnamese, , TODO confirm, English')).toEqual([
      'Vietnamese',
      'English',
    ]);
    expect(splitPublicList(null)).toEqual([]);
  });

  it('joins only finished values', () => {
    expect(joinPublicList(['Hanoi', '', 'TBD', null, ' Remote '])).toBe('Hanoi · Remote');
    expect(joinPublicList(['TODO'])).toBe('');
  });
});
