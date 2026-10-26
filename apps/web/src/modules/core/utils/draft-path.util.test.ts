import { describe, expect, it } from 'vitest';

import { safeDraftPath } from './draft-path.util';

describe('safeDraftPath', () => {
  it('accepts public locale routes', () => {
    expect(safeDraftPath('/en/projects/sample-case')).toBe('/en/projects/sample-case');
    expect(safeDraftPath('/vi/notes/a-note')).toBe('/vi/notes/a-note');
  });

  it('rejects open redirects and admin paths', () => {
    expect(safeDraftPath('https://evil.test')).toBe('/en');
    expect(safeDraftPath('//evil.test')).toBe('/en');
    expect(safeDraftPath('/admin/projects/1')).toBe('/en');
  });
});
