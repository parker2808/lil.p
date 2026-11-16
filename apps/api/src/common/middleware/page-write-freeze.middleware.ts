import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import type { RequestWithId } from './request-id.middleware';

export function pageWritesFrozen(): boolean {
  return process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test'
    ? true
    : process.env.CMS_PAGE_WRITE_FREEZE === '1';
}

function isPageAdminPath(rawUrl: string): boolean {
  let path = rawUrl.split('?')[0] ?? '';
  try {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    }
  } catch {
    return /^\/api\//i.test(path) && /admin|%61dmin/i.test(path);
  }
  const canonical = path.replace(/\\/g, '/').replace(/\/+/g, '/').toLowerCase();
  return /^\/api\/admin\/pages(?:\/|$)/.test(canonical);
}

function hasMethodOverride(request: Request): boolean {
  return (
    Object.keys(request.headers).some((header) =>
      /^(?:x-http-method(?:-override)?|x-method-override|x-original-method)$/i.test(header),
    ) ||
    Object.keys(request.query).some((key) => /^_?method$/i.test(key)) ||
    (typeof request.body === 'object' &&
      request.body !== null &&
      Object.keys(request.body as object).some((key) => /^_?method$/i.test(key)))
  );
}

@Injectable()
export class PageWriteFreezeMiddleware implements NestMiddleware {
  use(request: RequestWithId, response: Response, next: NextFunction): void {
    if (
      !pageWritesFrozen() ||
      !isPageAdminPath(request.originalUrl) ||
      (['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !hasMethodOverride(request))
    ) {
      next();
      return;
    }

    response.setHeader('Retry-After', '120');
    response.status(503).json({
      statusCode: 503,
      code: 'INTERNAL',
      message: 'Page writes temporarily paused',
      requestId: request.requestId,
    });
  }
}
