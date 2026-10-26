import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ProjectsService } from './projects.service';

const published = {
  id: 1,
  slug: 'particula',
  titleEn: 'Particula',
  titleVi: 'Particula',
  taglineEn: 'Migrate without a freeze',
  taglineVi: 'Migrate mà không đóng băng',
  client: 'Acme',
  roleEn: 'Frontend Engineer',
  roleVi: 'Kỹ sư frontend',
  teamSize: 4,
  startDate: new Date('2024-01-01'),
  endDate: null,
  versionFrom: 'v1',
  versionTo: 'v2',
  isFeatured: true,
  isConfidential: true,
  liveUrl: 'https://example.com/live',
  repoUrl: 'https://example.com/repo',
  problemEn: 'Old stack',
  problemVi: 'Stack cũ',
  constraintsEn: 'Weekly ship',
  constraintsVi: 'Ship hàng tuần',
  approachEn: 'Strangler',
  approachVi: 'Strangler',
  decisionsEn: 'TanStack Query',
  decisionsVi: 'TanStack Query',
  outcomeEn: 'No freeze',
  outcomeVi: 'Không đóng băng',
  lessonsEn: 'Contracts first',
  lessonsVi: 'Hợp đồng trước',
  keyFactsEn: 'Zero downtime\nSix months',
  keyFactsVi: 'Không downtime\nSáu tháng',
  factChipsEn: 'Vue 2 → Nuxt 3, 0 downtime',
  factChipsVi: 'Vue 2 → Nuxt 3, 0 downtime',
  seoTitleEn: null,
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  sortOrder: 0,
  domain: {
    slug: 'fintech',
    nameEn: 'Fintech',
    nameVi: 'Fintech',
    hue: 'AMBER',
    iconKey: 'wallet',
  },
  experience: {
    id: 2,
    company: 'Acme Platform',
    roleEn: 'Frontend Engineer',
    roleVi: 'Kỹ sư frontend',
    startDate: new Date('2022-07-01'),
    endDate: null,
  },
  skills: [{ name: 'Nuxt 3', slug: 'nuxt', sortOrder: 0 }],
  metrics: [
    {
      id: 9,
      labelEn: 'Release freeze',
      labelVi: 'Đóng băng release',
      before: 'yes',
      after: 'no',
      value: '0',
      sortOrder: 0,
    },
  ],
};

describe('ProjectsService', () => {
  it('returns 404 for an unknown or unpublished slug', async () => {
    const prisma = { project: { findFirst: vi.fn().mockResolvedValue(null) } };
    const service = new ProjectsService(prisma as never);
    await expect(service.getPublic('missing', 'en')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('includes the linked experience and hides confidential urls', async () => {
    const prisma = { project: { findFirst: vi.fn().mockResolvedValue(published) } };
    const service = new ProjectsService(prisma as never);
    const detail = await service.getPublic('particula', 'en');

    expect(detail.experience).toMatchObject({
      company: 'Acme Platform',
      role: 'Frontend Engineer',
    });
    expect(detail.liveUrl).toBeNull();
    expect(detail.repoUrl).toBeNull();
    expect(detail.keyFacts).toEqual(['Zero downtime', 'Six months']);
    expect(detail.topMetric?.label).toBe('Release freeze');
  });

  it('filters published projects by skill slug', async () => {
    const findMany = vi.fn().mockResolvedValue([published]);
    const service = new ProjectsService({ project: { findMany } } as never);
    await service.listPublic('en', { skill: 'nuxt' });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED', skills: { some: { slug: 'nuxt' } } },
      }),
    );
  });

  it('lists only featured published projects when asked', async () => {
    const findMany = vi.fn().mockResolvedValue([published]);
    const service = new ProjectsService({ project: { findMany } } as never);
    await service.listPublic('en', { featured: '1' });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED', isFeatured: true },
      }),
    );
  });
});
