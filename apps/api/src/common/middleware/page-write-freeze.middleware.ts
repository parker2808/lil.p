import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import type { PrismaService } from '../../prisma/prisma.service';
import type { RequestWithId } from './request-id.middleware';

const draftTreeMigration = '20261111043000_add_page_draft_tree';
let migrationReady = false;

export async function verifyPageDraftMigration(
  prisma: Pick<PrismaService, '$queryRaw'>,
): Promise<void> {
  migrationReady = false;
  try {
    const applied = (await prisma.$queryRaw`
      SELECT migration_name FROM _prisma_migrations
      WHERE migration_name = ${draftTreeMigration} AND finished_at IS NOT NULL
        AND rolled_back_at IS NULL LIMIT 1
    `) as { migration_name: string }[];
    if (applied.length !== 1 || applied[0]?.migration_name !== draftTreeMigration) return;
    const columns = (await prisma.$queryRaw`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'page'
        AND COLUMN_NAME IN ('draftTree', 'draftTreeRevision')
    `) as { COLUMN_NAME: string }[];
    migrationReady =
      Array.isArray(columns) &&
      columns.length === 2 &&
      columns.some((column) => column.COLUMN_NAME === 'draftTree') &&
      columns.some((column) => column.COLUMN_NAME === 'draftTreeRevision');
  } catch {
    migrationReady = false;
  }
}

export function pageWritesFrozen(): boolean {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return process.env.CMS_PAGE_WRITE_FREEZE === '1';
  }
  return process.env.CMS_PAGE_WRITE_FREEZE !== '0' || !migrationReady;
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
