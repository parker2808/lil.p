import { type AdminExperience, type AdminExperienceListPage, qk } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/experience.service', () => ({
  listAdminExperience: vi.fn(),
  getAdminExperience: vi.fn(),
  updateAdminExperience: vi.fn(),
  removeAdminExperience: vi.fn(),
  reorderAdminExperience: vi.fn(),
}));

import { updateAdminExperience } from '../services/experience.service';
import { useToggleExperienceVisible } from './use-admin-experience.hook';

const params = { page: 1, pageSize: 20, sort: '-startDate' as const };
const item: AdminExperience = {
  id: 4,
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
};
const page: AdminExperienceListPage = { items: [item], page: 1, pageSize: 20, total: 1 };

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useToggleExperienceVisible', () => {
  it('rolls the visibility switch back when the write returns 500', async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
    client.setQueryData(qk.admin.list('experience', params), page);
    vi.mocked(updateAdminExperience).mockRejectedValue(
      Object.assign(new Error('fail'), { status: 500 }),
    );

    const { result } = renderHook(() => useToggleExperienceVisible(params), {
      wrapper: wrapper(client),
    });

    await act(async () => {
      result.current.mutate(item);
    });

    await waitFor(() => {
      expect(
        client.getQueryData<AdminExperienceListPage>(qk.admin.list('experience', params))?.items[0]
          ?.isVisible,
      ).toBe(true);
    });
  });
});
