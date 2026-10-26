import { describe, expect, it } from 'vitest';

import { localeQuerySchema, localeSchema } from './locale.schema';

describe('localeSchema', () => {
  it('accepts en and vi', () => {
    expect(localeSchema.parse('en')).toBe('en');
    expect(localeSchema.parse('vi')).toBe('vi');
  });

  it('defaults locale query to en', () => {
    expect(localeQuerySchema.parse({})).toEqual({ locale: 'en' });
  });
});
