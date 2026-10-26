import { describe, expect, it } from 'vitest';

import { readingMinutes } from './reading-time.util';

describe('readingMinutes', () => {
  it('rounds up at 220 words per minute', () => {
    expect(readingMinutes(Array.from({ length: 221 }, () => 'word').join(' '))).toBe(2);
    expect(readingMinutes('one two three')).toBe(1);
  });
});
