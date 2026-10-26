import { describe, expect, it } from 'vitest';

import { pickGroup } from './pick-locale.util';

const row = {
  headlineEn: 'Hello',
  headlineVi: 'Xin chào',
  subheadlineEn: 'Line',
  subheadlineVi: 'Dòng',
};

describe('pickGroup', () => {
  it('returns Vietnamese when every English field has a Vietnamese value', () => {
    const picked = pickGroup(row, ['headline', 'subheadline'] as const, 'vi');
    expect(picked).toEqual({
      values: { headline: 'Xin chào', subheadline: 'Dòng' },
      lang: 'vi',
    });
  });

  it('falls back to English when any Vietnamese value is missing', () => {
    const picked = pickGroup(
      { ...row, subheadlineVi: '' },
      ['headline', 'subheadline'] as const,
      'vi',
    );
    expect(picked.lang).toBe('en');
    expect(picked.values).toEqual({ headline: 'Hello', subheadline: 'Line' });
  });

  it('returns English when locale is en', () => {
    const picked = pickGroup(row, ['headline'] as const, 'en');
    expect(picked).toEqual({ values: { headline: 'Hello' }, lang: 'en' });
  });
});
