import { describe, expect, it, vi } from 'vitest';

import { PagesService } from './pages.service';

const heroProps = {
  primaryCta: { label: { en: 'View work', vi: 'Xem' }, href: '/projects' },
  showDiagram: true,
  showAvailability: true,
};

describe('PagesService', () => {
  it('serves the published snapshot and drops unknown snapshot blocks', async () => {
    const prisma = {
      page: {
        findUnique: vi.fn().mockResolvedValue({
          key: 'HOME',
          publishedVersion: {
            snapshot: {
              seo: {
                seoTitleEn: 'Home',
                seoTitleVi: 'Trang chủ',
                seoDescriptionEn: 'Desc',
                seoDescriptionVi: 'Mô tả',
              },
              blocks: [
                {
                  type: 'hero',
                  key: 'hero',
                  layout: 'SPLIT_7_5',
                  surface: 'PLAIN',
                  schemaVersion: 1,
                  props: heroProps,
                  isVisible: true,
                  sortOrder: 0,
                },
                {
                  type: 'nope',
                  key: 'broken',
                  layout: 'ONE',
                  surface: 'PLAIN',
                  schemaVersion: 1,
                  props: {},
                  isVisible: true,
                  sortOrder: 1,
                },
              ],
            },
          },
        }),
      },
    };

    const service = new PagesService(prisma as never);
    const page = await service.getPublic('home', 'vi', 'req-test');
    expect(page.key).toBe('home');
    expect(page.blocks).toHaveLength(1);
    expect(page.blocks[0]?.type).toBe('hero');
    expect(page.blocks[0]?.lang).toBe('vi');
  });

  it('returns an empty shell when the page was never published', async () => {
    const prisma = {
      page: {
        findUnique: vi.fn().mockResolvedValue({
          key: 'HOME',
          publishedVersion: null,
        }),
      },
    };
    const service = new PagesService(prisma as never);
    const page = await service.getPublic('home', 'en');
    expect(page.blocks).toEqual([]);
  });
});
