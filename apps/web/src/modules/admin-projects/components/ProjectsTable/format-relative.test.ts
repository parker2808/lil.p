import { describe, expect, it } from 'vitest';

import { formatRelative } from './ProjectsTable';

describe('formatRelative', () => {
  it('formats minutes, hours and days from a real timestamp', () => {
    const now = Date.parse('2026-10-26T12:00:00.000Z');
    expect(formatRelative('2026-10-26T11:50:00.000Z', now)).toBe('10m');
    expect(formatRelative('2026-10-26T09:00:00.000Z', now)).toBe('3h');
    expect(formatRelative('2026-10-24T12:00:00.000Z', now)).toBe('2d');
  });
});
