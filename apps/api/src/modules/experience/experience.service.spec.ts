import { describe, expect, it, vi } from 'vitest';

import { ExperienceService } from './experience.service';

const row = {
  id: 3,
  company: 'Acme',
  companyUrl: null,
  location: 'Remote',
  employmentType: 'FULL_TIME',
  roleEn: 'Frontend',
  roleVi: '',
  summaryEn: '',
  summaryVi: '',
  highlightsEn: '',
  highlightsVi: '',
  startDate: new Date('2024-01-01'),
  endDate: null,
  sortOrder: 0,
  isVisible: false,
  skills: [],
  updatedAt: new Date('2026-10-26'),
};

describe('ExperienceService', () => {
  it('pages admin experience and filters hidden rows', async () => {
    const findMany = vi.fn().mockResolvedValue([row]);
    const prisma = {
      experience: { findMany, count: vi.fn().mockResolvedValue(1) },
      $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    const service = new ExperienceService(prisma as never);
    const page = await service.listAdmin({
      page: 1,
      pageSize: 20,
      sort: '-startDate',
      visible: '0',
    });

    expect(page).toMatchObject({ page: 1, pageSize: 20, total: 1 });
    expect(page.items[0]?.isVisible).toBe(false);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        where: { isVisible: false },
        orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
      }),
    );
  });
});
