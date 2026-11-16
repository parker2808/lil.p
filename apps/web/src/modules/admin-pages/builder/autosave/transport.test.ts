import { beforeEach, expect, it, vi } from 'vitest';

import { apiClient } from '@/modules/core/services/api-client.service';

import { readActiveBuilderDraft } from './transport';

vi.mock('@/modules/core/services/api-client.service', () => ({ apiClient: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

it('preserves a concurrent legacy restore as a null tree for typed review', async () => {
  vi.mocked(apiClient).mockResolvedValue({ mode: 'legacy', revision: '9', tree: null });
  await expect(readActiveBuilderDraft('ideas')).resolves.toEqual({ revision: '9', tree: null });
});

it('rejects an invalid legacy response rather than treating it as an empty page', async () => {
  vi.mocked(apiClient).mockResolvedValue({ mode: 'legacy', revision: 'invalid', tree: null });
  await expect(readActiveBuilderDraft('ideas')).rejects.toThrow('Invalid builder draft response');
});
