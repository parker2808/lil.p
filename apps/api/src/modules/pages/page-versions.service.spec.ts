import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageVersionsService } from './page-versions.service';

const hero = {
  id: 1,
  type: 'hero',
  key: 'hero',
  layout: 'SPLIT_7_5' as const,
  surface: 'PLAIN' as const,
  schemaVersion: 1,
  props: {
    primaryCta: { label: { en: 'View work', vi: 'Xem' }, href: '/projects' },
    showDiagram: true,
    showAvailability: true,
  },
  isVisible: true,
  sortOrder: 0,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function pageRow(over: Record<string, unknown> = {}) {
  return {
    id: 10,
    key: 'HOME',
    seoTitleEn: 'Home',
    seoTitleVi: 'Trang chủ',
    seoDescriptionEn: 'Desc',
    seoDescriptionVi: 'Mô tả',
    publishedVersionId: null,
    publishedVersion: null,
    publishedAt: null,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    blocks: [hero],
    ...over,
  };
}

describe('PageVersionsService', () => {
  let prisma: {
    page: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    pageVersion: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    };
    pageBlock: { deleteMany: ReturnType<typeof vi.fn>; createMany: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let service: PageVersionsService;

  beforeEach(() => {
    prisma = {
      page: { findUnique: vi.fn(), update: vi.fn() },
      pageVersion: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        aggregate: vi.fn(),
      },
      pageBlock: { deleteMany: vi.fn(), createMany: vi.fn() },
      $transaction: vi.fn(async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma)),
    };
    service = new PageVersionsService(prisma as never);
  });

  it('rejects publish when a visible block is invalid', async () => {
    prisma.page.findUnique.mockResolvedValue(
      pageRow({
        blocks: [
          hero,
          {
            ...hero,
            id: 2,
            type: 'nope',
            key: 'ghost',
            sortOrder: 1,
          },
        ],
      }),
    );

    await expect(service.publish('home', {}, 1)).rejects.toMatchObject({
      response: { code: 'INVALID_BLOCKS' },
    });
    expect(prisma.pageVersion.create).not.toHaveBeenCalled();
  });

  it('rejects publish when English SEO is missing', async () => {
    prisma.page.findUnique.mockResolvedValue(pageRow({ seoTitleEn: '' }));
    await expect(service.publish('home', {}, 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects publish when the H1 is missing', async () => {
    prisma.page.findUnique.mockResolvedValue(pageRow({ blocks: [] }));
    await expect(service.publish('home', {}, 1)).rejects.toBeInstanceOf(ConflictException);
  });
});
