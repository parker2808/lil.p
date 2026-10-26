import { describe, expect, it } from 'vitest';

import { safeAdminNext } from './safe-next.util';

describe('safeAdminNext', () => {
  it('accepts admin paths and rejects open redirects', () => {
    expect(safeAdminNext('/admin/projects')).toBe('/admin/projects');
    expect(safeAdminNext('/admin')).toBe('/admin');
    expect(safeAdminNext('/en/projects')).toBe('/admin');
    expect(safeAdminNext('https://evil.test')).toBe('/admin');
    expect(safeAdminNext('//evil.test')).toBe('/admin');
    expect(safeAdminNext(null)).toBe('/admin');
  });
});
