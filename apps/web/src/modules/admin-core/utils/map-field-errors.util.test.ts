import { describe, expect, it } from 'vitest';

import { mapFieldErrors } from './map-field-errors.util';

describe('mapFieldErrors', () => {
  it('takes the first message per field', () => {
    expect(
      mapFieldErrors({
        fieldErrors: { titleEn: ['Required', 'Too short'], slug: ['Taken'] },
      }),
    ).toEqual({ titleEn: 'Required', slug: 'Taken' });
  });

  it('returns an empty object when there are no field errors', () => {
    expect(mapFieldErrors(undefined)).toEqual({});
  });
});
