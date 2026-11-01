import { describe, expect, it } from 'vitest';

import { formatDateTime, formatRelativeTime } from './relative-time.util';

describe('formatRelativeTime', () => {
  it('uses minutes for recent timestamps', () => {
    const now = Date.parse('2026-10-26T12:10:00.000Z');
    expect(formatRelativeTime('2026-10-26T12:05:00.000Z', now)).toBe('5 minutes ago');
  });

  it('uses days for older timestamps', () => {
    const now = Date.parse('2026-10-26T12:00:00.000Z');
    expect(formatRelativeTime('2026-10-24T12:00:00.000Z', now)).toBe('2 days ago');
  });

  it('formats relative time in English and Vietnamese', () => {
    const now = Date.parse('2026-10-26T12:10:00.000Z');
    expect(formatRelativeTime('2026-10-26T12:05:00.000Z', now, 'en')).toBe('5 minutes ago');
    expect(formatRelativeTime('2026-10-26T12:05:00.000Z', now, 'vi')).toBe('5 phút trước');
  });

  it('formats absolute dates using the requested locale', () => {
    const iso = '2026-10-26T12:05:00.000Z';
    expect(formatDateTime(iso, 'en')).toMatch(/Oct 26, 2026/);
    expect(formatDateTime(iso, 'vi')).toMatch(/26 thg 10, 2026/);
  });
});
