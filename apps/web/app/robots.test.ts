import { afterEach, describe, expect, it, vi } from 'vitest';

import robots from './robots';

describe('robots', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('disallows /admin and /api and points at the sitemap', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://parker.test');
    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      sitemap: 'https://parker.test/sitemap.xml',
    });
  });
});
