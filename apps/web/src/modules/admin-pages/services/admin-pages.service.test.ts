import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAdminPage } from './admin-pages.service';

const apiClient = vi.fn();
vi.mock('@/modules/core/services/api-client.service', () => ({
  apiClient: (...args: unknown[]) => apiClient(...args),
}));

const input = { title: 'Ideas', key: 'ideas', locale: 'vi', template: 'empty' } as const;
const page = {
  key: 'ideas',
  title: 'Ideas',
  locale: 'vi',
  seoTitleEn: null,
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  updatedAt: '2026-11-03T00:00:00.000Z',
  publishedVersion: null,
  publishedAt: null,
  hasUnpublishedChanges: true,
  blocks: [],
};

describe('createAdminPage', () => {
  beforeEach(() => apiClient.mockReset());

  it('posts the selected choices and parses the created page', async () => {
    apiClient.mockResolvedValue(page);
    await expect(createAdminPage(input)).resolves.toEqual(page);
    expect(apiClient).toHaveBeenCalledWith('/api/admin/pages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  });
});
