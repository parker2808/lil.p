import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublicSiteService } from './public-site.service';

function prismaMock() {
  return {
    page: { findMany: vi.fn().mockResolvedValue([]) },
    project: { findMany: vi.fn().mockResolvedValue([]) },
    post: { findMany: vi.fn().mockResolvedValue([]) },
  };
}

describe('PublicSiteService.getSitemap', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let service: PublicSiteService;

  beforeEach(() => {
    prisma = prismaMock();
    service = new PublicSiteService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      prisma as never,
    );
  });

  it('maps published pages, projects and posts and skips drafts', async () => {
    prisma.page.findMany.mockResolvedValue([
      {
        key: 'HOME',
        publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
      },
      {
        key: 'ABOUT',
        publishedAt: null,
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    ]);
    prisma.project.findMany.mockResolvedValue([
      { slug: 'live-case', updatedAt: new Date('2026-04-01T00:00:00.000Z') },
    ]);
    prisma.post.findMany.mockResolvedValue([
      { slug: 'live-note', updatedAt: new Date('2026-05-01T00:00:00.000Z') },
    ]);

    await expect(service.getSitemap()).resolves.toEqual({
      entries: [
        { path: '/', updatedAt: '2026-01-01T00:00:00.000Z' },
        { path: '/about', updatedAt: '2026-03-01T00:00:00.000Z' },
        { path: '/projects/live-case', updatedAt: '2026-04-01T00:00:00.000Z' },
        { path: '/notes/live-note', updatedAt: '2026-05-01T00:00:00.000Z' },
      ],
    });
    expect(prisma.page.findMany).toHaveBeenCalledWith({
      where: { publishedVersionId: { not: null } },
      select: { key: true, publishedAt: true, updatedAt: true },
    });
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    expect(prisma.post.findMany).toHaveBeenCalledWith({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
  });
});
