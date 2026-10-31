import { afterEach, describe, expect, it, vi } from 'vitest';

type CookieJar = { get: (name: string) => { value: string } | undefined };

const cookies = vi.hoisted(() => vi.fn(async (): Promise<CookieJar> => ({ get: () => undefined })));

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import type { Locale } from '@portfolio/contracts';

import { ApiError } from '../utils/api-error.util';
import { apiServer, isApiReachable } from './api-server.service';

describe('apiServer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    cookies.mockClear();
  });

  it('maps a non-2xx body onto ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          statusCode: 404,
          code: 'NOT_FOUND',
          message: 'missing',
          requestId: 'req-1',
        }),
      }),
    );

    const error = await apiServer('/api/nope').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'missing',
      requestId: 'req-1',
    });
  });

  it('treats an unsupported locale as not found without calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      apiServer('/api/public/site', { locale: 'favicon.ico' as Locale }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('caches public reads under the shared public tag without reading cookies', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hello: 'world' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiServer('/api/public/test', { tags: ['test-tag'] });

    expect(result).toEqual({ hello: 'world' });
    expect(cookies).not.toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(init).toMatchObject({
      method: 'GET',
      next: { revalidate: 3600, tags: ['public', 'test-tag'] },
    });
    expect(init.headers).toBeUndefined();
  });

  it('forwards the access cookie and skips the cache for authed reads', async () => {
    cookies.mockResolvedValueOnce({ get: () => ({ value: 'tok' }) });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal('fetch', fetchMock);

    await apiServer('/api/auth/me', { withAuth: true });

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(init.cache).toBe('no-store');
    expect(init).not.toHaveProperty('next');
    expect(new Headers(init.headers).get('cookie')).toBe('access_token=tok');
  });
});

describe('isApiReachable', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is false when the API cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(isApiReachable()).resolves.toBe(false);
  });

  it('is true when /api/health answers ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await expect(isApiReachable()).resolves.toBe(true);
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/\/api\/health$/);
  });
});
