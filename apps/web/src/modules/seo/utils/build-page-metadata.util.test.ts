import type { PublicSite } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { describe, expect, it, vi } from 'vitest';

import { getPage } from '@/modules/blocks/services/pages.service';
import { getSite } from '@/modules/core/services/site.service';

import { buildPageMetadata } from './build-page-metadata.util';

vi.mock('next/headers', () => ({ draftMode: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/modules/blocks/services/pages.service', () => ({ getPage: vi.fn() }));
vi.mock('@/modules/core/services/site.service', () => ({ getSite: vi.fn() }));

const tree = {
  schemaVersion: 1,
  root: {
    id: 'root',
    type: 'page',
    responsive: { base: {} },
    sections: [
      {
        id: 'section',
        type: 'section',
        responsive: { base: {} },
        content: [
          {
            id: 'header',
            type: 'component',
            componentType: 'page-header',
            responsive: {
              base: {
                eyebrow: { en: 'Work', vi: 'Công việc' },
                title: { en: 'Selected work', vi: 'Dự án tiêu biểu' },
                intro: { en: 'Projects overview', vi: 'Tổng quan dự án' },
              },
            },
          },
        ],
      },
    ],
  },
};

describe('tree page metadata', () => {
  it.each([
    ['en', 'Selected work', 'Projects overview'],
    ['vi', 'Dự án tiêu biểu', 'Tổng quan dự án'],
  ] as const)('uses the visible %s H1 when SEO is blank', async (locale, title, description) => {
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    vi.mocked(getSite).mockResolvedValueOnce({
      settings: { siteName: 'Portfolio', seoTitle: 'Generic', seoDescription: 'Generic intro' },
    } as PublicSite);
    vi.mocked(getPage).mockResolvedValueOnce({
      key: 'projects',
      seo: { title: null, description: null, lang: locale },
      tree,
    });
    const metadata = await buildPageMetadata('projects', Promise.resolve({ locale }));
    expect(metadata.title).toBe(`${title} · Portfolio`);
    expect(metadata.description).toBe(description);
    expect(metadata.openGraph).toMatchObject({ title: `${title} · Portfolio`, description });
  });

  it.each(['en', 'vi'] as const)('preserves explicit %s SEO on a tree', async (locale) => {
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: false } as never);
    vi.mocked(getSite).mockResolvedValueOnce({
      settings: { siteName: 'Portfolio', seoTitle: 'Generic', seoDescription: 'Generic intro' },
    } as PublicSite);
    vi.mocked(getPage).mockResolvedValueOnce({
      key: 'projects',
      seo: { title: 'Editorial title', description: 'Editorial description', lang: locale },
      tree,
    });
    const metadata = await buildPageMetadata('projects', Promise.resolve({ locale }));
    expect(metadata.title).toBe('Editorial title · Portfolio');
    expect(metadata.description).toBe('Editorial description');
  });
});
