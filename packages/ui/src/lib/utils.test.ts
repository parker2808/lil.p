import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('keeps a custom type size next to a color class', () => {
    const classes = cn('text-title', 'text-primary').split(/\s+/).sort();
    expect(classes).toEqual(['text-primary', 'text-title']);
  });

  it('lets a later type size replace an earlier one', () => {
    expect(cn('text-title', 'text-prose')).toBe('text-prose');
  });
});
