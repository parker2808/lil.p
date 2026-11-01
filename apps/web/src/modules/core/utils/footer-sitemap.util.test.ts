import type { PublicNavItem } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import { footerSitemap } from './footer-sitemap.util';

const item = (id: number, href: string, location: 'HEADER' | 'FOOTER'): PublicNavItem => ({
  id,
  location,
  label: href,
  href,
  lang: 'en',
});

describe('footerSitemap', () => {
  it('keeps header order and appends footer-only links once', () => {
    const header = [item(1, '/projects', 'HEADER'), item(2, '/about', 'HEADER')];
    const footer = [item(3, '/projects', 'FOOTER'), item(4, '/notes', 'FOOTER')];

    expect(footerSitemap(header, footer).map((link) => link.href)).toEqual([
      '/projects',
      '/about',
      '/notes',
    ]);
  });
});
