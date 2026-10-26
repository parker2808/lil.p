import { type AdminPage, qk } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/admin-pages.service', () => ({
  createAdminBlock: vi.fn(),
  deleteAdminBlock: vi.fn(),
  duplicateAdminBlock: vi.fn(),
  reorderAdminBlocks: vi.fn(),
  updateAdminBlock: vi.fn(),
  updateAdminPage: vi.fn(),
}));

import { reorderAdminBlocks } from '../services/admin-pages.service';
import { useBlockMutations } from './use-block-mutations.hook';

const reorder = vi.mocked(reorderAdminBlocks);

const page: AdminPage = {
  key: 'home',
  seoTitleEn: 'Home',
  seoTitleVi: '',
  seoDescriptionEn: '',
  seoDescriptionVi: '',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedVersion: null,
  publishedAt: null,
  hasUnpublishedChanges: true,
  blocks: [
    {
      id: 1,
      type: 'hero',
      key: 'hero',
      layout: 'ONE',
      surface: 'PLAIN',
      schemaVersion: 1,
      props: {},
      isVisible: true,
      sortOrder: 0,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      type: 'featured-case',
      key: 'featured',
      layout: 'ONE',
      surface: 'PLAIN',
      schemaVersion: 1,
      props: {},
      isVisible: true,
      sortOrder: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 3,
      type: 'case-grid',
      key: 'work',
      layout: 'THREE',
      surface: 'PLAIN',
      schemaVersion: 1,
      props: {},
      isVisible: true,
      sortOrder: 2,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

describe('useBlockMutations', () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    client.setQueryData(qk.admin.pages.detail('home'), page);
    reorder.mockReset();
  });

  it('restores the previous order when reorder fails', async () => {
    reorder.mockRejectedValue(new Error('forced 500'));
    const { result } = renderHook(
      () => useBlockMutations('home', { reorderFailed: 'Reorder failed' }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          createElement(QueryClientProvider, { client }, children),
      },
    );

    result.current.reorder.mutate([1, 3, 2]);
    await waitFor(() => expect(result.current.reorder.isError).toBe(true));
    expect(
      client
        .getQueryData<AdminPage>(qk.admin.pages.detail('home'))
        ?.blocks.map((block) => block.key),
    ).toEqual(['hero', 'featured', 'work']);
  });
});
