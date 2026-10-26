import type { INestApplication } from '@nestjs/common';
import { filter, firstValueFrom } from 'rxjs';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { EventsService } from '../src/modules/events/events.service';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestUsers, TEST_ORIGIN, testEmail, userAgent } from './helpers/auth.helper';
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

describe('admin events', () => {
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

  it('forbids a user from the event stream', async () => {
    const agent = await userAgent(app);
    const res = await agent.get('/api/admin/events').expect(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('forwards contact.created after a public submit without the email', async () => {
    const events = app.get(EventsService);
    const pending = firstValueFrom(
      events.stream().pipe(filter((event) => event.type === 'contact.created')),
    );

    await request(app.getHttpServer())
      .post('/api/public/contact')
      .set('Origin', TEST_ORIGIN)
      .send(contactBody())
      .expect(201);

    const event = await pending;
    expect(event).toMatchObject({
      type: 'contact.created',
      data: { name: 'Ana' },
    });
    expect(JSON.stringify(event)).not.toContain(testEmail('visitor'));
  });

  it('requires a signed-in admin for the event stream', async () => {
    const res = await request(app.getHttpServer()).get('/api/admin/events').expect(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });
});
