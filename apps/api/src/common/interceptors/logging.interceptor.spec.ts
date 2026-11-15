import { type ExecutionContext, Logger } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  it('logs only the route template and a non-reversible request identifier', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const request = {
      method: 'GET',
      url: '/api/admin/pages/pii-marker/builder/draft?token=token-marker',
      route: { path: '/api/admin/pages/:key/builder/draft' },
      requestId: 'token-marker',
      body: { tree: { text: 'draft-marker' } },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as ExecutionContext;
    try {
      await lastValueFrom(new LoggingInterceptor().intercept(context, { handle: () => of({}) }));
      expect(log).toHaveBeenCalledOnce();
      const line = String(log.mock.calls[0]?.[0]);
      expect(line).toContain('GET /api/admin/pages/:key/builder/draft request=');
      expect(line).not.toMatch(/draft-marker|token-marker|pii-marker/);
    } finally {
      log.mockRestore();
    }
  });
});
