import { describe, expect, it } from 'vitest';
import { normalizeSearch } from './search.util';

describe('palette search', () => {
  it('matches Vietnamese accents, stroke d and case', () => {
    expect(normalizeSearch('  ĐƯỜNG dẫn  ')).toBe('duong dan');
    expect(normalizeSearch('Dự án').includes(normalizeSearch('du a'))).toBe(true);
  });
});
