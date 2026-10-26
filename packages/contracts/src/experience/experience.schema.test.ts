import { describe, expect, it } from 'vitest';

import {
  adminExperienceListPageSchema,
  adminExperienceListParamsSchema,
} from './experience.schema';

describe('adminExperienceListParamsSchema', () => {
  it('defaults to newest start date and accepts a visibility filter', () => {
    expect(adminExperienceListParamsSchema.parse({ visible: '0' })).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: '-startDate',
      visible: '0',
    });
  });
});

describe('adminExperienceListPageSchema', () => {
  it('wraps admin experience rows', () => {
    const page = adminExperienceListPageSchema.parse({
      items: [
        {
          id: 1,
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
          startDate: '2024-01-01',
          endDate: null,
          sortOrder: 0,
          isVisible: true,
          skillIds: [],
          updatedAt: '2026-10-26T00:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    });
    expect(page.total).toBe(1);
    expect(page.items[0]?.company).toBe('Acme');
  });
});
