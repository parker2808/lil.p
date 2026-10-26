import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient, refreshOnce } from './api-client.service';

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns undefined for an empty 204 body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => ({}) }),
    );
    await expect(apiClient('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('refreshes once and retries an admin 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ code: 'UNAUTHENTICATED', message: 'expired' }),
      })
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 1, email: '<email>', name: 'Admin', role: 'admin' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient('/api/auth/me')).resolves.toMatchObject({ role: 'admin' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
  });

  it('shares one in-flight refresh', async () => {
    let resolveRefresh: ((value: Response) => void) | undefined;
    const refresh = new Promise<Response>((resolve) => {
      resolveRefresh = resolve;
    });
    const fetchMock = vi.fn((input: string) => {
      if (input === '/api/auth/refresh') {
        return refresh;
      }
      return Promise.resolve({ ok: true, status: 204 } as Response);
    });
    vi.stubGlobal('fetch', fetchMock);
    const first = refreshOnce();
    const second = refreshOnce();
    resolveRefresh?.({ ok: true, status: 204 } as Response);
    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
      expect.objectContaining({ signal: controller.signal, credentials: 'include' }),
    );
  });
});
