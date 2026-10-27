import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient, needsAuthRefresh, refreshOnce, resetAuthRefresh } from './api-client.service';

function unauthorized(): Response {
  return {
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    json: async () => ({ code: 'UNAUTHENTICATED', message: 'expired' }),
  } as Response;
}

describe('apiClient', () => {
  afterEach(() => {
    resetAuthRefresh();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns undefined for an empty 204 body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => ({}) }),
    );
    await expect(apiClient('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('matches auth prefixes on absolute URLs and relative paths', () => {
    expect(needsAuthRefresh('/api/auth/me')).toBe(true);
    expect(needsAuthRefresh('https://api.example.test/api/auth/me')).toBe(true);
    expect(needsAuthRefresh('https://api.example.test/api/admin/projects')).toBe(true);
    expect(needsAuthRefresh('https://api.example.test/api/public/site')).toBe(false);
    expect(needsAuthRefresh('/api/public/site')).toBe(false);
  });

  it('refreshes once and retries an admin 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
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

  it('refreshes an admin 401 when NEXT_PUBLIC_API_URL is absolute', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 1, email: '<email>', name: 'Admin', role: 'admin' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient('/api/auth/me')).resolves.toMatchObject({ role: 'admin' });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.example.test/api/auth/me',
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://api.example.test/api/auth/refresh', {
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

  it('does not call refresh again after a failed refresh', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign, pathname: '/admin', search: '' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      })
      .mockResolvedValueOnce(unauthorized());
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient('/api/auth/me')).rejects.toMatchObject({ status: 401 });
    await expect(apiClient('/api/auth/me')).rejects.toMatchObject({ status: 401 });

    const refreshCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes('/api/auth/refresh'),
    );
    expect(refreshCalls).toHaveLength(1);
    expect(assign).toHaveBeenCalled();
  });

  it('does not refresh a public 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue(unauthorized());
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiClient('/api/public/site')).rejects.toMatchObject({ status: 401 });
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
