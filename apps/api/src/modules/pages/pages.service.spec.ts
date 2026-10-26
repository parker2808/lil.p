import { describe, expect, it, vi } from 'vitest';

import { PagesService } from './pages.service';

describe('PagesService', () => {
  it('drops unknown or invalid blocks and still returns the page', async () => {
    const prisma = {
      page: {
        findUnique: vi.fn().mockResolvedValue({
          key: 'HOME',
          seoTitleEn: 'Home',
          seoTitleVi: 'Trang chủ',
          seoDescriptionEn: 'Desc',
          seoDescriptionVi: 'Mô tả',
          blocks: [
            {
              id: 1,
              type: 'hero',
              key: 'hero',
              layout: 'SPLIT_7_5',
              surface: 'PLAIN',
              schemaVersion: 1,
              props: {
                primaryCta: { label: { en: 'View work', vi: 'Xem' }, href: '/projects' },
                showDiagram: true,
                showAvailability: true,
              },
              sortOrder: 0,
              isVisible: true,
            },
            {
              id: 2,
              type: 'nope',
              key: 'broken',
              layout: 'ONE',
              surface: 'PLAIN',
              schemaVersion: 1,
              props: {},
              sortOrder: 1,
              isVisible: true,
            },
          ],
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
});
