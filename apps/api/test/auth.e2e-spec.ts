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
  TEST_USER,
  testEmail,
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

function cookieValue(line: string): string {
  return line.split(';')[0]?.split('=').slice(1).join('=') ?? '';
}

describe('auth', () => {
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

  it('logs in with httpOnly cookies and returns me with role', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password })
      .expect(200);

    expect(res.body).toMatchObject({
      email: TEST_ADMIN.email,
      name: TEST_ADMIN.name,
      role: 'admin',
    });
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.body).not.toHaveProperty('tokenVersion');
    expect(JSON.stringify(res.body)).not.toMatch(/access_token|refresh_token|eyJ/);

    const cookies = setCookies(res);
    const access = cookie(cookies, 'access_token');
    const refresh = cookie(cookies, 'refresh_token');
    expect(access).toBeDefined();
    expect(refresh).toBeDefined();
    expect(access).toMatch(/HttpOnly/i);
    expect(refresh).toMatch(/HttpOnly/i);
    expect(access).toMatch(/Path=\//);
    expect(refresh).toMatch(/Path=\/api\/auth/);
    expect(access).toMatch(/Max-Age=900/);
    expect(refresh).toMatch(/Max-Age=604800/);
    expect(access).toMatch(/SameSite=Lax/i);
    expect(refresh).toMatch(/SameSite=Lax/i);
    expect(access).not.toMatch(/Secure/i);
    expect(refresh).not.toMatch(/Secure/i);

    const me = await adminAgent(app).then((agent) => agent.get('/api/auth/me').expect(200));
    expect(me.body.role).toBe('admin');
  });

  it('returns the same INVALID_CREDENTIALS for unknown, wrong, and inactive', async () => {
    const unknown = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testEmail('nobody'), password: TEST_ADMIN.password })
      .expect(401);
    expect(unknown.body.code).toBe('INVALID_CREDENTIALS');

    const wrong = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_ADMIN.email, password: 'not-the-password' })
      .expect(401);
    expect(wrong.body.code).toBe('INVALID_CREDENTIALS');

    await prisma.user.update({
      where: { email: TEST_USER.email },
      data: { isActive: false },
    });
    const inactive = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(401);
    expect(inactive.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects an expired or tampered access token with 401', async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: TEST_ADMIN.email } });
    const now = Math.floor(Date.now() / 1000);
    const expired = await jwt.signAsync(
      { sub: String(admin.id), role: 'admin', iat: now - 120, exp: now - 60 },
      { secret: process.env.JWT_ACCESS_SECRET, algorithm: 'HS256' },
    );
    const expiredRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', `access_token=${expired}`)
      .expect(401);
    expect(expiredRes.body.code).toBe('UNAUTHENTICATED');

    const valid = await jwt.signAsync(
      { sub: String(admin.id), role: 'admin' },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: 900, algorithm: 'HS256' },
    );
    const tampered = `${valid.slice(0, -2)}aa`;
    const tamperedRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', `access_token=${tampered}`)
      .expect(401);
    expect(tamperedRes.body.code).toBe('UNAUTHENTICATED');
  });

  it('rotates cookies on refresh and rejects a bumped tokenVersion', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password })
      .expect(200);
    const first = setCookies(login);
    const access = cookie(first, 'access_token');
    const refresh = cookie(first, 'refresh_token');
    expect(access && refresh).toBeTruthy();

    const rotated = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set(
        'Cookie',
        `access_token=${cookieValue(access ?? '')}; refresh_token=${cookieValue(refresh ?? '')}`,
      )
      .expect(204);
    const next = setCookies(rotated);
    expect(cookie(next, 'access_token')).toMatch(/HttpOnly/i);
    expect(cookie(next, 'refresh_token')).toMatch(/HttpOnly/i);
    expect(cookieValue(cookie(next, 'access_token') ?? '').split('.').length).toBe(3);
    expect(cookieValue(cookie(next, 'refresh_token') ?? '').split('.').length).toBe(3);

    const admin = await prisma.user.findUniqueOrThrow({ where: { email: TEST_ADMIN.email } });
    await prisma.user.update({
      where: { id: admin.id },
      data: { tokenVersion: { increment: 1 } },
    });
    const stale = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set(
        'Cookie',
        `access_token=${cookieValue(cookie(next, 'access_token') ?? '')}; refresh_token=${cookieValue(cookie(next, 'refresh_token') ?? '')}`,
      )
      .expect(401);
    expect(stale.body.code).toBe('UNAUTHENTICATED');
  });

  it('clears cookies on logout so me then returns 401', async () => {
    const agent = await adminAgent(app);
    await agent.get('/api/auth/me').expect(200);

    const logout = await agent.post('/api/auth/logout').expect(204);
    const cleared = setCookies(logout);
    const access = cookie(cleared, 'access_token');
    const refresh = cookie(cleared, 'refresh_token');
    expect(access).toBeDefined();
    expect(refresh).toBeDefined();
    expect(cookieValue(access ?? '')).toBe('');
    expect(cookieValue(refresh ?? '')).toBe('');

    const me = await agent.get('/api/auth/me').expect(401);
    expect(me.body.code).toBe('UNAUTHENTICATED');
  });
});
