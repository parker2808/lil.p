import { type AdminPostListItem, type AdminPostListPage, qk } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/admin-posts.service', () => ({
  listAdminPosts: vi.fn(),
  getAdminPost: vi.fn(),
  archiveAdminPost: vi.fn(),
}));

import { archiveAdminPost } from '../services/admin-posts.service';
import { useArchiveAdminPost } from './use-admin-posts.hook';

const params = { page: 1, pageSize: 20, sort: '-updatedAt' as const };
const item: AdminPostListItem = {
  id: 8,
  slug: 'sample-note',
  titleEn: 'Sample note',
  titleVi: '',
  status: 'DRAFT',
  isFeatured: false,
  readingMinutes: 3,
  publishedAt: null,
  updatedAt: '2026-10-26T00:00:00.000Z',
  tags: [],
};
const page: AdminPostListPage = { items: [item], page: 1, pageSize: 20, total: 1 };

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useArchiveAdminPost', () => {
  it('restores the row when archive returns 500', async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
    client.setQueryData(qk.admin.list('posts', params), page);
    vi.mocked(archiveAdminPost).mockRejectedValue(
      Object.assign(new Error('fail'), { status: 500 }),
    );

    const { result } = renderHook(() => useArchiveAdminPost(params), {
      wrapper: wrapper(client),
    });

    await act(async () => {
      result.current.mutate(8);
    });

    await waitFor(() => {
      expect(client.getQueryData<AdminPostListPage>(qk.admin.list('posts', params))?.items).toEqual(
        [item],
      );
    });
  });
});
