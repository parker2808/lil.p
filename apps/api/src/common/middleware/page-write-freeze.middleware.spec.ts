import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  type MiddlewareConsumer,
  Module,
  type NestModule,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  deploymentState,
  DeploymentStateController,
} from '../../modules/health/deployment-state.controller';
import { HealthController } from '../../modules/health/health.controller';
import { AdminPagesController } from '../../modules/pages/admin-pages.controller';
import { PageVersionsService } from '../../modules/pages/page-versions.service';
import { PagesService } from '../../modules/pages/pages.service';
import { PublicPagesController } from '../../modules/pages/public-pages.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';
import { RolesGuard } from '../guards/roles.guard';
import { PageWriteFreezeMiddleware, pageWritesFrozen } from './page-write-freeze.middleware';
import { RequestIdMiddleware } from './request-id.middleware';

const pages = {
  listAdmin: vi.fn(async () => []),
  getAdmin: vi.fn(async () => ({ key: 'home' })),
  getPublic: vi.fn(async (key: string, locale: string) => ({ key, locale })),
  createPage: vi.fn(),
  updatePage: vi.fn(),
  createBlock: vi.fn(),
  reorderBlocks: vi.fn(),
  updateBlock: vi.fn(),
  duplicateBlock: vi.fn(),
  deleteBlock: vi.fn(),
};
const versions = {
  listVersions: vi.fn(async () => []),
  getVersion: vi.fn(async () => ({ version: 1 })),
  publish: vi.fn(),
  restore: vi.fn(),
  discard: vi.fn(),
};
const db = { $queryRaw: vi.fn(async () => [{ 1: 1 }]) };

class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: { role: string; id: number };
    }>();
    const role = request.headers['x-test-role'];
    if (!role) throw new UnauthorizedException();
    request.user = { role, id: 7 };
    return true;
  }
}

@Module({
  controllers: [
    AdminPagesController,
    PublicPagesController,
    DeploymentStateController,
    HealthController,
  ],
  providers: [
    { provide: PagesService, useValue: pages },
    { provide: PageVersionsService, useValue: versions },
    { provide: PrismaService, useValue: db },
  ],
})
class FreezeTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, PageWriteFreezeMiddleware).forRoutes('*');
  }
}

describe('pre-D2 Stage A page write freeze', () => {
  let app: INestApplication;

  beforeAll(async () => {
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', '1');
    const module = await Test.createTestingModule({
      imports: [FreezeTestModule],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards(new TestAuthGuard(), new RolesGuard(app.get(Reflector)));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    vi.unstubAllEnvs();
  });

  it('cannot be unfrozen by a production environment override', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', '0');
    expect(pageWritesFrozen()).toBe(true);
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', '1');
  });

  it('uses the production AppModule middleware before the page service', async () => {
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
      .useValue(db)
      .overrideProvider(PagesService)
      .useValue(pages)
      .overrideProvider(PageVersionsService)
      .useValue(versions)
      .compile();
    const productionWiringApp = module.createNestApplication();
    productionWiringApp.setGlobalPrefix('api');
    try {
      await productionWiringApp.init();
      versions.publish.mockClear();
      const response = await request(productionWiringApp.getHttpServer())
        .post('/api/admin/pages/home/publish')
        .send({})
        .expect(503);
      expect(response.headers['retry-after']).toBe('120');
      expect(versions.publish).not.toHaveBeenCalled();
    } finally {
      await productionWiringApp.close();
    }
  }, 20_000);

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
    ['POST', '/api/admin/pages/future-mutation'],
    ['POST', '/api/ADMIN/PAGES/home/publish'],
    ['POST', '/api/%61dmin/pages/home/publish'],
    ['POST', '/api/admin%252Fpages/home/publish'],
  ])('503 before service access: %s %s', async (method, path) => {
    const response = await request(app.getHttpServer())
      [method.toLowerCase() as 'post'](path)
      .set('x-test-role', 'admin')
      .send({})
      .expect(503);
    expect(response.headers['retry-after']).toBe('120');
    expect(response.body).toMatchObject({
      statusCode: 503,
      code: 'INTERNAL',
      message: 'Page writes temporarily paused',
      requestId: expect.any(String),
    });
    expect(Object.values(pages).filter((call) => call.mock.calls.length)).toEqual([]);
    expect(Object.values(versions).filter((call) => call.mock.calls.length)).toEqual([]);
  });

  it.each([
    ['x-http-method-override', 'POST'],
    ['x-method-override', 'DELETE'],
    ['x-http-method', 'PATCH'],
    ['x-original-method', 'POST'],
  ])('rejects GET with %s override', async (header, value) => {
    await request(app.getHttpServer())
      .get('/api/admin/pages')
      .set('x-test-role', 'admin')
      .set(header, value)
      .expect(503);
  });

  it('rejects query method override and preserves frozen reads', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/pages?_method=POST')
      .set('x-test-role', 'admin')
      .expect(503);
    await request(app.getHttpServer())
      .get('/api/admin/pages')
      .set('x-test-role', 'admin')
      .send({ _method: 'POST' })
      .expect(503);
    await request(app.getHttpServer())
      .get('/api/admin/pages')
      .set('x-test-role', 'admin')
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/admin/pages/home/versions')
      .set('x-test-role', 'admin')
      .expect(200);
    await request(app.getHttpServer()).get('/api/health').set('x-test-role', 'admin').expect(200);
    for (const locale of ['en', 'vi']) {
      await request(app.getHttpServer())
        .get(`/api/public/pages/home?locale=${locale}`)
        .set('x-test-role', 'admin')
        .expect(200)
        .expect(({ body }) => expect(body).toMatchObject({ key: 'home', locale }));
    }
    expect(pages.listAdmin).toHaveBeenCalledOnce();
    expect(pages.getPublic).toHaveBeenCalledTimes(2);
    expect(versions.listVersions).toHaveBeenCalledOnce();
  });

  it('retains a role-protected, allowlisted instance identity', async () => {
    vi.stubEnv('RENDER_GIT_COMMIT', 'a'.repeat(40));
    vi.stubEnv('RENDER_INSTANCE_ID', 'srv-instance-1');
    vi.stubEnv('RENDER_SERVICE_ID', 'srv-service-1');
    await request(app.getHttpServer()).get('/api/admin/deployment-state').expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/deployment-state')
      .set('x-test-role', 'user')
      .expect(403);
    const response = await request(app.getHttpServer())
      .get('/api/admin/deployment-state')
      .set('x-test-role', 'admin')
      .expect(200);
    expect(response.body).toEqual({
      pageWritesFrozen: true,
      commit: 'a'.repeat(40),
      instanceId: 'srv-instance-1',
      serviceId: 'srv-service-1',
    });
    vi.stubEnv('RENDER_INSTANCE_ID', 'unsafe/value');
    expect(deploymentState().instanceId).toBeNull();
  });

  it.each(['direct-api', 'vercel-rewrite'])(
    'blocks %s ingress and leaves reads available',
    async (ingress) => {
      const probe = request(app.getHttpServer())
        .post('/api/admin/pages/home/publish')
        .set('x-test-role', 'admin');
      if (ingress === 'vercel-rewrite') probe.set('x-forwarded-host', 'site.example');
      await probe.send({}).expect(503);
      await request(app.getHttpServer())
        .get('/api/admin/pages/home')
        .set('x-test-role', 'admin')
        .expect(200);
    },
  );
});
