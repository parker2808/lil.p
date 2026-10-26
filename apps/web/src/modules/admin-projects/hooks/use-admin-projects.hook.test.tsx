import { type AdminProjectListItem, type AdminProjectListPage, qk } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/admin-projects.service', () => ({
  listAdminProjects: vi.fn(),
  getAdminProject: vi.fn(),
  archiveAdminProject: vi.fn(),
  updateAdminProject: vi.fn(),
  reorderAdminProjects: vi.fn(),
}));

import { archiveAdminProject } from '../services/admin-projects.service';
import { useArchiveAdminProject } from './use-admin-projects.hook';

const params = { page: 1, pageSize: 20, sort: 'sortOrder' as const };
const item: AdminProjectListItem = {
  id: 11,
  slug: 'sample-case',
  titleEn: 'Sample case',
  titleVi: '',
  status: 'DRAFT',
  isFeatured: false,
  domainId: null,
  updatedAt: '2026-10-26T00:00:00.000Z',
  keyFactsCount: 1,
  domain: null,
};
const page: AdminProjectListPage = { items: [item], page: 1, pageSize: 20, total: 1 };

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useArchiveAdminProject', () => {
  it('restores the row when archive returns 500', async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
    client.setQueryData(qk.admin.list('projects', params), page);
    vi.mocked(archiveAdminProject).mockRejectedValue(
      Object.assign(new Error('fail'), { status: 500 }),
    );

    const { result } = renderHook(() => useArchiveAdminProject(params), {
      wrapper: wrapper(client),
    });

    await act(async () => {
      result.current.mutate(11);
    });

    await waitFor(() => {
      expect(
        client.getQueryData<AdminProjectListPage>(qk.admin.list('projects', params))?.items,
      ).toEqual([item]);
    });
  });
});
