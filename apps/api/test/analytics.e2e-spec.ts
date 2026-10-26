import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { siteSettingsData } from '../prisma/seed/data/site.data';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestUsers, TEST_ORIGIN, userAgent } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

describe('analytics', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let users: UsersService;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
    users = app.get(UsersService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
    await createTestUsers(users);
    await prisma.siteSettings.create({
      data: { id: 1, ...siteSettingsData, analyticsEnabled: true },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('records a public view and shows it on admin stats without setting a cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/public/views')
      .set('Origin', TEST_ORIGIN)
      .set('User-Agent', 'Mozilla/5.0 TestBrowser')
      .send({ path: '/', locale: 'en', referrer: 'https://github.com/x' })
      .expect(204);
    expect(res.headers['set-cookie']).toBeUndefined();

    expect(await prisma.pageView.count()).toBe(1);

    await request(app.getHttpServer())
      .post('/api/public/views')
      .set('Origin', TEST_ORIGIN)
      .set('User-Agent', 'Googlebot/2.1')
      .send({ path: '/', locale: 'en' })
      .expect(204);
    expect(await prisma.pageView.count()).toBe(1);

    await request(app.getHttpServer())
      .post('/api/public/views')
      .set('Origin', TEST_ORIGIN)
      .set('User-Agent', 'Mozilla/5.0 TestBrowser')
      .send({ path: '/admin', locale: 'en' })
      .expect(204);
    expect(await prisma.pageView.count()).toBe(1);

    const agent = await userAgent(app);
    const stats = await agent.get('/api/admin/stats?range=7d').expect(200);
    expect(stats.body.views.total).toBe(1);
    expect(stats.body.views.uniqueVisitors).toBe(1);
    expect(stats.body.views.topPages).toEqual([{ path: '/', views: 1 }]);
    expect(stats.body.views.topReferrers).toEqual([{ host: 'github.com', views: 1 }]);
  });

  it('skips writes when analytics is disabled', async () => {
    await prisma.siteSettings.update({ where: { id: 1 }, data: { analyticsEnabled: false } });
    await request(app.getHttpServer())
      .post('/api/public/views')
      .set('Origin', TEST_ORIGIN)
      .set('User-Agent', 'Mozilla/5.0 TestBrowser')
      .send({ path: '/', locale: 'en' })
      .expect(204);
    expect(await prisma.pageView.count()).toBe(0);
  });
});
