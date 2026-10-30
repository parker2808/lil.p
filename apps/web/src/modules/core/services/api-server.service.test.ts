import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined }),
}));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import type { Locale } from '@portfolio/contracts';

import { ApiError } from '../utils/api-error.util';
import { apiServer } from './api-server.service';

describe('apiServer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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
});
