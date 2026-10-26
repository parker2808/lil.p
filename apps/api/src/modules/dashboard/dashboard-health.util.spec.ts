import { describe, expect, it } from 'vitest';

import { lintFieldNames, missingViFieldNames, splitFactLines } from './dashboard-health.util';

describe('dashboard health helpers', () => {
  it('counts non-empty key-fact lines', () => {
    expect(splitFactLines('Zero downtime\n\nSix months\n')).toEqual([
      'Zero downtime',
      'Six months',
    ]);
    expect(splitFactLines('One fact')).toHaveLength(1);
  });

  it('lists Vi fields that are empty when En has text', () => {
    expect(
      missingViFieldNames([
        { name: 'titleVi', en: 'Sample case', vi: '' },
        { name: 'taglineVi', en: 'A short tagline', vi: '   ' },
        { name: 'roleVi', en: 'Frontend Engineer', vi: 'Kỹ sư frontend' },
        { name: 'seoTitleVi', en: '', vi: '' },
      ]),
    ).toEqual(['titleVi', 'taglineVi']);
  });

  it('lists English fields that fail publish lint', () => {
    expect(lintFieldNames({ titleEn: 'Ready', bodyEn: 'TODO: finish this note' })).toEqual([
      'bodyEn',
    ]);
    expect(lintFieldNames({ titleEn: 'Ready', bodyEn: 'Shipped.' })).toEqual([]);
  });
});
