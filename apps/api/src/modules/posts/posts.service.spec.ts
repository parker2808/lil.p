import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { PostsService } from './posts.service';

const published = {
  id: 1,
  slug: 'vue-to-react',
  titleEn: 'Vue to React',
  titleVi: '',
  excerptEn: 'What transfers.',
  excerptVi: '',
  bodyEn: 'English body',
  bodyVi: '',
  takeawaysEn: 'Keep the contracts',
  takeawaysVi: '',
  seoTitleEn: null,
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  readingMinutes: 6,
  isFeatured: true,
  publishedAt: new Date('2026-10-12'),
  sortOrder: 0,
  tags: [{ id: 1, slug: 'react', nameEn: 'React', nameVi: 'React' }],
};

describe('PostsService', () => {
  it('returns 404 for a draft or unknown slug', async () => {
    const service = new PostsService({
      post: { findFirst: vi.fn().mockResolvedValue(null) },
    } as never);
    await expect(service.getPublic('draft-note', 'en')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('pages published posts with a stable sort and total', async () => {
    const findMany = vi.fn().mockResolvedValue([published]);
    const prisma = {
      post: { findMany, count: vi.fn().mockResolvedValue(2) },
      $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    const service = new PostsService(prisma as never);
    const page = await service.listPublic('en', {
      page: 1,
      pageSize: 1,
      sort: '-publishedAt',
    });

    expect(page).toMatchObject({ page: 1, pageSize: 1, total: 2 });
    expect(page.items).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 1,
        orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
      }),
    );
  });

  it('filters admin lists by tag slug', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([{ ...published, status: 'DRAFT', updatedAt: new Date('2026-10-26') }]);
    const prisma = {
      post: { findMany, count: vi.fn().mockResolvedValue(1) },
      $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    const service = new PostsService(prisma as never);
    const page = await service.listAdmin({
      page: 1,
      pageSize: 20,
      sort: '-updatedAt',
      tag: 'react',
    });

    expect(page.items[0]?.tags).toEqual([{ id: 1, slug: 'react', nameEn: 'React' }]);
    expect(page.items[0]?.readingMinutes).toBe(6);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tags: { some: { slug: 'react' } } },
      }),
    );
  });

  it('falls back to English when Vietnamese body is missing', async () => {
    const service = new PostsService({
      post: { findFirst: vi.fn().mockResolvedValue(published) },
    } as never);
    const detail = await service.getPublic('vue-to-react', 'vi');
    expect(detail.lang).toBe('en');
    expect(detail.body).toBe('English body');
  });
});
