import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

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
});
