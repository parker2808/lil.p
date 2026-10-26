import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  adminAgent,
  createTestUsers,
  TEST_ADMIN,
  TEST_ORIGIN,
  TEST_USER,
  userAgent,
} from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

describe('guards', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let users: UsersService;
  let jwt: JwtService;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
    users = app.get(UsersService);
    jwt = app.get(JwtService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
    await createTestUsers(users);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects a write without a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/projects')
      .set('Origin', TEST_ORIGIN)
      .send({ slug: 'x' })
      .expect(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  it('rejects an expired access token', async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: TEST_ADMIN.email } });
    const now = Math.floor(Date.now() / 1000);
    const expired = await jwt.signAsync(
      { sub: String(admin.id), role: 'admin', iat: now - 120, exp: now - 60 },
      { secret: process.env.JWT_ACCESS_SECRET, algorithm: 'HS256' },
    );
    const res = await request(app.getHttpServer())
      .get('/api/admin/projects')
      .set('Cookie', `access_token=${expired}`)
      .expect(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  it('lets a user read admin lists but not write', async () => {
    const agent = await userAgent(app);
    await agent.get('/api/admin/projects').expect(200);
    const write = await agent.post('/api/admin/projects').send({ slug: 'nope' }).expect(403);
    expect(write.body.code).toBe('FORBIDDEN');
  });

  it('lets an admin write', async () => {
    const agent = await adminAgent(app);
    const res = await agent.get('/api/admin/projects').expect(200);
    expect(res.body.items).toEqual([]);
  });

  it('rejects a foreign or missing Origin on writes', async () => {
    const agent = await adminAgent(app);
    const foreign = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Origin', 'https://evil.test')
      .expect(403);
    expect(foreign.body.code).toBe('BAD_ORIGIN');

    const missing = await request(app.getHttpServer()).post('/api/auth/logout').expect(403);
    expect(missing.body.code).toBe('BAD_ORIGIN');

    await agent.post('/api/auth/logout').expect(204);
  });

  it('returns 429 on the 6th bad login in a minute', async () => {
    process.env.E2E_THROTTLE = '1';
    try {
      for (let i = 0; i < 5; i += 1) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .set('Origin', TEST_ORIGIN)
          .send({ email: TEST_USER.email, password: 'wrong-password' })
          .expect(401);
      }
      const limited = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', TEST_ORIGIN)
        .send({ email: TEST_USER.email, password: 'wrong-password' })
        .expect(429);
      expect(limited.body.code).toBe('RATE_LIMITED');
    } finally {
      delete process.env.E2E_THROTTLE;
    }
  });
});
