import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardService } from './dashboard.service';

function prismaMock() {
  return {
    project: {
      groupBy: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    post: {
      groupBy: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    skill: {
      count: vi.fn().mockResolvedValue(0),
    },
    contactMessage: {
      count: vi.fn().mockResolvedValue(0),
    },
    media: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    page: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    profileStat: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  };
}

describe('DashboardService', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let service: DashboardService;

  beforeEach(() => {
    prisma = prismaMock();
    service = new DashboardService(prisma as never);
  });

  it('returns zeroed counts for an empty catalog', async () => {
    await expect(service.getStats('30d')).resolves.toEqual({
      range: '30d',
      projects: {
        draft: 0,
        published: 0,
        archived: 0,
        publishedInRange: 0,
        publishedInPrevious: 0,
      },
      posts: {
        draft: 0,
        published: 0,
        archived: 0,
        publishedInRange: 0,
        publishedInPrevious: 0,
      },
      messages: { unread: 0 },
    });
  });

  it('maps groupBy rows onto status counts', async () => {
    prisma.project.groupBy.mockResolvedValue([
      { status: 'DRAFT', _count: { id: 2 } },
      { status: 'PUBLISHED', _count: { id: 1 } },
    ]);
    prisma.post.groupBy.mockResolvedValue([{ status: 'PUBLISHED', _count: { id: 3 } }]);
    prisma.project.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    prisma.post.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    await expect(service.getStats('7d')).resolves.toMatchObject({
      range: '7d',
      projects: {
        draft: 2,
        published: 1,
        archived: 0,
        publishedInRange: 1,
        publishedInPrevious: 0,
      },
      posts: { draft: 0, published: 3, archived: 0, publishedInRange: 2, publishedInPrevious: 1 },
    });
  });

  it('lists the v2 content-health checks', async () => {
    prisma.project.findMany.mockResolvedValue([
      {
        id: 11,
        titleEn: 'Sample case',
        status: 'PUBLISHED',
        domainId: null,
        titleVi: '',
        taglineEn: 'A short tagline',
        taglineVi: '',
        roleEn: 'Frontend Engineer',
        roleVi: '',
        problemEn: 'Old path',
        problemVi: '',
        constraintsEn: 'No freeze',
        constraintsVi: '',
        approachEn: 'Slice the work',
        approachVi: '',
        decisionsEn: 'Tokens first',
        decisionsVi: '',
        outcomeEn: 'Shipped',
        outcomeVi: '',
        lessonsEn: 'Keep the contract',
        lessonsVi: '',
        keyFactsEn: 'Zero downtime',
        keyFactsVi: '',
        factChipsEn: 'Stack A',
        factChipsVi: '',
      },
    ]);
    prisma.post.findMany.mockResolvedValue([
      {
        id: 4,
        titleEn: 'Draft note',
        status: 'DRAFT',
        titleVi: '',
        excerptEn: 'A short excerpt',
        excerptVi: '',
        bodyEn: 'TODO: finish this note',
        bodyVi: '',
        takeawaysEn: 'Keep the contract',
        takeawaysVi: '',
      },
    ]);
    prisma.skill.count.mockResolvedValue(2);

    const health = await service.getHealth();
    expect(health.summary).toEqual({
      drafts: 1,
      missingVi: 1,
      noDomain: 1,
      fewKeyFacts: 1,
      marqueeCount: 2,
      publishLint: 1,
      missingAlt: 0,
      neverPublished: 0,
      staleDrafts: 0,
      invalidPageBlocks: 0,
      brokenRefs: 0,
    });
    expect(health.issues.map((issue) => issue.kind)).toEqual([
      'PROJECT_NO_DOMAIN',
      'CASE_STUDY_KEY_FACTS',
      'MISSING_VI',
      'PUBLISH_LINT',
      'MARQUEE_SKILLS',
    ]);
    expect(health.issues.find((issue) => issue.kind === 'PROJECT_NO_DOMAIN')?.href).toBe(
      '/admin/projects/11',
    );
    expect(health.issues.find((issue) => issue.kind === 'PUBLISH_LINT')?.href).toBe(
      '/admin/posts/4',
    );
  });
});
