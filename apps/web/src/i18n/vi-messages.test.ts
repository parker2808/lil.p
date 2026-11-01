import { describe, expect, it } from 'vitest';

import en from '../../i18n/locales/en.json';
import vi from '../../i18n/locales/vi.json';

function missingKeys(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  path = '',
): string[] {
  return Object.entries(source).flatMap(([key, value]) => {
    const nextPath = path ? `${path}.${key}` : key;
    const translated = target[key];
    if (typeof value === 'string') return typeof translated === 'string' ? [] : [nextPath];
    if (value && typeof value === 'object') {
      return missingKeys(
        value as Record<string, unknown>,
        translated && typeof translated === 'object' ? (translated as Record<string, unknown>) : {},
        nextPath,
      );
    }
    return [];
  });
}

describe('Vietnamese messages', () => {
  it('has zero missing English message keys', () => {
    expect(missingKeys(en, vi)).toEqual([]);
  });
});
