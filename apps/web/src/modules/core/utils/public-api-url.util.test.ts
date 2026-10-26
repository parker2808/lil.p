import { afterEach, describe, expect, it, vi } from 'vitest';

import { publicApiBase, publicApiUrl } from './public-api-url.util';

describe('publicApiUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps same-origin paths when NEXT_PUBLIC_API_URL is unset', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    expect(publicApiBase()).toBe('');
    expect(publicApiUrl('/api/health')).toBe('/api/health');
  });

  it('prefixes the Render origin when set', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test/');
    expect(publicApiUrl('/api/health')).toBe('https://api.example.test/api/health');
  });
});
