import { Controller, Get, type INestApplication, Module, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../../prisma/prisma.service';
import {
  PageWriteFreezeMiddleware,
  pageWritesFrozen,
  verifyPageDraftMigration,
} from './page-write-freeze.middleware';
import { RequestIdMiddleware } from './request-id.middleware';

const migrationName = '20261111043000_add_page_draft_tree';
const writes = vi.fn(() => ({ saved: true }));
const columns = [{ COLUMN_NAME: 'draftTree' }, { COLUMN_NAME: 'draftTreeRevision' }];
const database = {
  $queryRaw: vi.fn(async () => [{ migration_name: migrationName }]),
};

@Controller('admin/pages')
class ProbeController {
  @Get()
  read() {
    return { readable: true };
  }

  @Post('home/publish')
  publish() {
    return writes();
  }
}

@Module({ controllers: [ProbeController] })
class ProbeModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, PageWriteFreezeMiddleware).forRoutes('*');
  }
}

describe('D2 write reopening', () => {
  let app: INestApplication;

  beforeAll(async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', undefined);
    const module = await Test.createTestingModule({ imports: [ProbeModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await verifyPageDraftMigration({
      $queryRaw: vi.fn().mockRejectedValue(new Error('closed')),
    } as never);
    vi.unstubAllEnvs();
  });

  async function expectFrozen(): Promise<void> {
    writes.mockClear();
    const response = await request(app.getHttpServer())
      .post('/api/admin/pages/home/publish')
      .send({})
      .expect(503);
    expect(response.headers['retry-after']).toBe('120');
    expect(response.body).toMatchObject({
      statusCode: 503,
      code: 'INTERNAL',
      message: 'Page writes temporarily paused',
      requestId: expect.any(String),
    });
    expect(writes).not.toHaveBeenCalled();
    await request(app.getHttpServer()).get('/api/admin/pages').expect(200);
    await request(app.getHttpServer())
      .get('/api/admin/pages')
      .set('x-http-method-override', 'POST')
      .expect(503);
  }

  it.each([
    ['POST', '/api/admin/pages'],
    ['PATCH', '/api/admin/pages/home'],
    ['POST', '/api/admin/pages/home/blocks'],
    ['PATCH', '/api/admin/pages/home/blocks/order'],
    ['PATCH', '/api/admin/pages/home/blocks/1'],
    ['POST', '/api/admin/pages/home/blocks/1/duplicate'],
    ['DELETE', '/api/admin/pages/home/blocks/1'],
    ['POST', '/api/admin/pages/home/publish'],
    ['POST', '/api/admin/pages/home/versions/1/restore'],
    ['POST', '/api/admin/pages/home/discard'],
    ['POST', '/api/admin/pages/home/builder/activate'],
    ['PUT', '/api/admin/pages/home/builder/draft'],
    ['POST', '/api/admin/pages/home/builder/publish'],
    ['POST', '/api/admin/pages/home/versions/1/builder/restore'],
    ['POST', '/api/ADMIN/PAGES/home/publish'],
    ['POST', '/api/%61dmin/pages/home/publish'],
    ['POST', '/api/admin%252Fpages/home/publish'],
  ])('retains the Stage A freeze for %s %s', async (method, path) => {
    await request(app.getHttpServer())[method.toLowerCase() as 'post'](path).send({}).expect(503);
  });

  it('keeps production frozen until startup verification without a kill-switch', async () => {
    await expectFrozen();
  });

  it('stays frozen before startup verification with an unset kill-switch', async () => {
    expect(pageWritesFrozen()).toBe(true);
    await expectFrozen();
  });

  it('stays frozen when migration history or columns are absent, or the check throws', async () => {
    for (const rows of [[], [{ migration_name: migrationName }]]) {
      const query = vi
        .fn()
        .mockResolvedValueOnce(rows)
        .mockResolvedValueOnce([{ COLUMN_NAME: 'draftTree' }]);
      await verifyPageDraftMigration({ $queryRaw: query } as never);
      await expectFrozen();
    }
    await verifyPageDraftMigration({
      $queryRaw: vi.fn().mockRejectedValue(new Error('db')),
    } as never);
    await expectFrozen();
  });

  it('opens by default only after both migration history and physical columns check', async () => {
    database.$queryRaw.mockResolvedValueOnce([{ migration_name: migrationName }]);
    database.$queryRaw.mockResolvedValueOnce(columns as never);
    await verifyPageDraftMigration(database as never);
    expect(database.$queryRaw).toHaveBeenCalledTimes(2);
    expect(pageWritesFrozen()).toBe(false);
    await request(app.getHttpServer()).post('/api/admin/pages/home/publish').send({}).expect(201);
    expect(writes).toHaveBeenCalledOnce();
    await request(app.getHttpServer())
      .get('/api/admin/pages')
      .set('x-http-method-override', 'POST')
      .expect(200);
  });

  it('explicit kill-switch closes writes again without weakening reads', async () => {
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', '1');
    await expectFrozen();
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', undefined);
    expect(pageWritesFrozen()).toBe(false);
  });

  it('treats other kill-switch values as open only after verification', async () => {
    for (const value of ['0', 'false', 'unexpected']) {
      vi.stubEnv('CMS_PAGE_WRITE_FREEZE', value);
      expect(pageWritesFrozen()).toBe(false);
    }
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', undefined);
  });

  it('uses the real AppModule middleware before auth and service access', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', '1');
    vi.stubEnv('API_PORT', '4001');
    vi.stubEnv('WEB_ORIGIN', 'http://localhost:3000');
    vi.stubEnv('DATABASE_URL', 'mysql://localhost:3306/freeze_test');
    vi.stubEnv('JWT_ACCESS_SECRET', 'test-access-secret-at-least-32-chars!!');
    vi.stubEnv('JWT_REFRESH_SECRET', 'test-refresh-secret-at-least-32-chars!');
    const { AppModule } = await import('../../app.module');
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ $queryRaw: vi.fn() })
      .compile();
    const productionApp = module.createNestApplication();
    productionApp.setGlobalPrefix('api');
    try {
      await productionApp.init();
      await request(productionApp.getHttpServer())
        .post('/api/admin/pages/home/publish')
        .send({})
        .expect(503);
    } finally {
      await productionApp.close();
    }
  }, 20_000);
});
