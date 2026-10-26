import { describe, expect, it } from 'vitest';

import { formatRelativeTime } from './relative-time.util';

describe('formatRelativeTime', () => {
  it('uses minutes for recent timestamps', () => {
    const now = Date.parse('2026-10-26T12:10:00.000Z');
    expect(formatRelativeTime('2026-10-26T12:05:00.000Z', now)).toBe('5 minutes ago');
  });

  it('uses days for older timestamps', () => {
    const now = Date.parse('2026-10-26T12:00:00.000Z');
    expect(formatRelativeTime('2026-10-24T12:00:00.000Z', now)).toBe('2 days ago');
  });
});
