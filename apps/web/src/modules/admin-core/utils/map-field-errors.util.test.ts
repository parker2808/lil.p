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

  it('localizes API validation without changing field paths or hiding unknown failures', () => {
    expect(
      mapFieldErrors({ fieldErrors: { 'props.title.vi': ['Required'], key: ['Taken'] } }, 'vi'),
    ).toEqual({ 'props.title.vi': 'Bắt buộc', key: 'Giá trị không hợp lệ' });
  });

  it('keeps an empty server field message empty instead of inventing an error', () => {
    expect(mapFieldErrors({ fieldErrors: { key: [] } }, 'vi')).toEqual({ key: '' });
  });
});
