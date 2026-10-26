import type { INestApplication } from '@nestjs/common';
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
  testEmail,
  userAgent,
} from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function setCookies(res: request.Response): string[] {
  const raw = res.headers['set-cookie'];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') return [raw];
  return [];
}

function cookie(list: string[], name: string): string | undefined {
  return list.find((line) => line.startsWith(`${name}=`));
}

describe('users admin', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('forbids a user from listing accounts', async () => {
    const agent = await userAgent(app);
    const res = await agent.get('/api/admin/users').expect(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('signs a user out everywhere so refresh fails', async () => {
    const target = await userAgent(app);
    const admin = await adminAgent(app);
    const listed = await admin.get('/api/admin/users').expect(200);
    const row = listed.body.items.find((item: { email: string }) => item.email === TEST_USER.email);
    expect(JSON.stringify(listed.body)).not.toMatch(/passwordHash|tokenVersion|eyJ/);
    await admin.post(`/api/admin/users/${row.id}/sign-out-everywhere`).expect(204);
    await target.post('/api/auth/refresh').expect(401);
  });

  it('returns 409 when demoting yourself or the last admin', async () => {
    const admin = await adminAgent(app);
    const listed = await admin.get('/api/admin/users').expect(200);
    const self = listed.body.items.find(
      (item: { email: string }) => item.email === TEST_ADMIN.email,
    );
    const selfRes = await admin
      .patch(`/api/admin/users/${self.id}`)
      .send({ role: 'user' })
      .expect(409);
    expect(selfRes.body.code).toMatch(/CONFLICT|LAST_ADMIN/);

    const extra = await users.create({
      email: testEmail('second-admin'),
      name: 'Second',
      password: 'second-pass-12x',
      role: 'admin',
    });
    const demoted = await admin
      .patch(`/api/admin/users/${extra.id}`)
      .send({ isActive: false })
      .expect(200);
    expect(demoted.body.isActive).toBe(false);
    const blocked = await admin
      .patch(`/api/admin/users/${self.id}`)
      .send({ isActive: false })
      .expect(409);
    expect(blocked.body.code).toMatch(/CONFLICT|LAST_ADMIN/);
  });

  it('changes the current password and keeps this browser signed in', async () => {
    const agent = request.agent(app.getHttpServer());
    agent.set('Origin', TEST_ORIGIN);
    const login = await agent
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);
    const oldRefresh = cookie(setCookies(login), 'refresh_token');
    expect(oldRefresh).toBeDefined();

    const nextPassword = 'brand-new-pass12';
    const changed = await agent
      .patch('/api/auth/password')
      .send({ currentPassword: TEST_USER.password, newPassword: nextPassword })
      .expect(200);
    expect(changed.body).not.toHaveProperty('passwordHash');
    expect(changed.body).not.toHaveProperty('tokenVersion');

    await agent.get('/api/auth/me').expect(200);
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Origin', TEST_ORIGIN)
      .set('Cookie', oldRefresh as string)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', TEST_ORIGIN)
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', TEST_ORIGIN)
      .send({ email: TEST_USER.email, password: nextPassword })
      .expect(200);
  });
});
