import { describe, expect, it } from 'vitest';

import { slugify } from './slug.util';

describe('slugify', () => {
  it('turns a name into a kebab-case slug', () => {
    expect(slugify('React 19')).toBe('react-19');
  });

  it('strips accents and punctuation', () => {
    expect(slugify('  Route — Strangler  ')).toBe('route-strangler');
  });

  it('returns empty when nothing remains', () => {
    expect(slugify('***')).toBe('');
  });
});
