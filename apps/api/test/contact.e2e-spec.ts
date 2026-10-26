import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  adminAgent,
  createTestUsers,
  TEST_ORIGIN,
  testEmail,
  userAgent,
} from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function contactBody(over: Record<string, unknown> = {}) {
  return {
    name: 'Ana',
    email: testEmail('visitor'),
    message: 'Hello from the form',
    locale: 'en',
    ...over,
  };
}

describe('contact inbox', () => {
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

  it('stores a valid message and returns 201 without echoing the body', async () => {
    const topic = await prisma.contactTopic.create({
      data: { slug: 'job', labelEn: 'Job', labelVi: 'Viec' },
    });
    const res = await request(app.getHttpServer())
      .post('/api/public/contact')
      .set('Origin', TEST_ORIGIN)
      .send(contactBody({ topic: 'job' }))
      .expect(201);
    expect(res.body).toEqual({ ok: true });
    expect(JSON.stringify(res.body)).not.toContain(testEmail('visitor'));

    const admin = await adminAgent(app);
    const list = await admin.get('/api/admin/messages').expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0]).toMatchObject({
      name: 'Ana',
      email: testEmail('visitor'),
      status: 'NEW',
      topicId: topic.id,
      topic: { slug: 'job' },
    });

    const stats = await admin.get('/api/admin/stats').expect(200);
    expect(stats.body.messages.unread).toBe(1);
    const unread = await admin.get('/api/admin/messages/unread-count').expect(200);
    expect(unread.body).toEqual({ unread: 1 });
  });

  it('returns 400 fieldErrors for invalid input', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/public/contact')
      .set('Origin', TEST_ORIGIN)
      .send({ name: '', email: 'not-an-email', message: '' })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors.email).toBeDefined();
    expect(res.body.fieldErrors.name).toBeDefined();
    expect(res.body.fieldErrors.message).toBeDefined();
  });

  it('stores a honeypot as SPAM and hides it from the default inbox', async () => {
    await request(app.getHttpServer())
      .post('/api/public/contact')
      .set('Origin', TEST_ORIGIN)
      .send(contactBody({ website: 'https://spam.test' }))
      .expect(201);

    const admin = await adminAgent(app);
    const inbox = await admin.get('/api/admin/messages').expect(200);
    expect(inbox.body.total).toBe(0);
    const spam = await admin.get('/api/admin/messages?status=SPAM').expect(200);
    expect(spam.body.total).toBe(1);
    expect(spam.body.items[0].status).toBe('SPAM');
    expect(JSON.stringify(inbox.body)).not.toMatch(/passwordHash|tokenVersion/);
  });

  it('returns 429 on the 4th message in the window', async () => {
    process.env.E2E_THROTTLE = '1';
    try {
      for (let i = 0; i < 3; i += 1) {
        await request(app.getHttpServer())
          .post('/api/public/contact')
          .set('Origin', TEST_ORIGIN)
          .set('x-forwarded-for', '198.51.100.20')
          .send(contactBody({ email: testEmail(`visitor${i}`) }))
          .expect(201);
      }
      const limited = await request(app.getHttpServer())
        .post('/api/public/contact')
        .set('Origin', TEST_ORIGIN)
        .set('x-forwarded-for', '198.51.100.20')
        .send(contactBody({ email: testEmail('visitor3') }))
        .expect(429);
      expect(limited.body.code).toBe('RATE_LIMITED');
    } finally {
      delete process.env.E2E_THROTTLE;
    }
  });

  it('forbids a user from the inbox while still showing the unread number on stats', async () => {
    const agent = await userAgent(app);
    const inbox = await agent.get('/api/admin/messages').expect(403);
    expect(inbox.body.code).toBe('FORBIDDEN');
    await agent.get('/api/admin/messages/unread-count').expect(403);
    const stats = await agent.get('/api/admin/stats').expect(200);
    expect(stats.body.messages.unread).toBe(0);
  });

  it('lets an admin change status', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/public/contact')
      .set('Origin', TEST_ORIGIN)
      .send(contactBody())
      .expect(201);
    expect(created.body.ok).toBe(true);

    const admin = await adminAgent(app);
    const list = await admin.get('/api/admin/messages').expect(200);
    const id = list.body.items[0].id as number;
    const patched = await admin
      .patch(`/api/admin/messages/${id}`)
      .send({ status: 'READ' })
      .expect(200);
    expect(patched.body.status).toBe('READ');
    const unread = await admin.get('/api/admin/messages/unread-count').expect(200);
    expect(unread.body.unread).toBe(0);
  });
});
