import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from './api-client.service';

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards the abort signal to fetch', async () => {
    const controller = new AbortController();
    const abortError = Object.assign(new Error('Aborted'), { name: 'AbortError' });
    const fetchMock = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient('/api/health', { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
