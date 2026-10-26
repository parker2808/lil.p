import type { INestApplication } from '@nestjs/common';
import type { PostCreateInput } from '@portfolio/contracts';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function payload(over: Partial<PostCreateInput> = {}): PostCreateInput {
  return {
    slug: 'sample-note',
    titleEn: 'Sample note',
    titleVi: '',
    excerptEn: 'A short excerpt',
    excerptVi: '',
    bodyEn: 'Enough words to compute reading minutes for this note.',
    bodyVi: '',
    takeawaysEn: 'Keep the contract',
    takeawaysVi: '',
    ...over,
  };
}

describe('admin posts', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let users: UsersService;
  let agent: import('supertest').Agent;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
    users = app.get(UsersService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
    await createTestUsers(users);
    agent = await adminAgent(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, lists, updates, archives a post', async () => {
    const created = await agent.post('/api/admin/posts').send(payload()).expect(201);

    expect(created.body.status).toBe('DRAFT');
    expect(created.body.readingMinutes).toBeGreaterThanOrEqual(1);

    const listed = await agent.get('/api/admin/posts').expect(200);
    expect(listed.body.total).toBe(1);
    expect(listed.body.items[0]?.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(listed.body.items[0]?.tags).toEqual([]);

    const updated = await agent
      .patch(`/api/admin/posts/${created.body.id}`)
      .send({ titleEn: 'Renamed note', updatedAt: created.body.updatedAt })
      .expect(200);
    expect(updated.body.titleEn).toBe('Renamed note');

    const archived = await agent.delete(`/api/admin/posts/${created.body.id}`).expect(200);
    expect(archived.body.status).toBe('ARCHIVED');
  });

  it('returns 409 STALE when updatedAt is old', async () => {
    const created = await agent.post('/api/admin/posts').send(payload()).expect(201);

    await agent
      .patch(`/api/admin/posts/${created.body.id}`)
      .send({ titleEn: 'First save', updatedAt: created.body.updatedAt })
      .expect(200);

    const stale = await agent
      .patch(`/api/admin/posts/${created.body.id}`)
      .send({ titleEn: 'Second save', updatedAt: created.body.updatedAt })
      .expect(409);
    expect(stale.body.code).toBe('STALE');
  });

  it('returns 404 for an unknown id', async () => {
    await agent.get('/api/admin/posts/9999').expect(404);
  });

  it('returns 400 for an invalid body', async () => {
    const res = await agent.post('/api/admin/posts').send({ slug: 'Not A Slug' }).expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors).toBeDefined();
  });

  it('filters the list by tag slug', async () => {
    const tag = await agent.post('/api/admin/tags').send({ nameEn: 'React' }).expect(201);
    await agent.post('/api/admin/posts').send(payload()).expect(201);
    const tagged = await agent
      .post('/api/admin/posts')
      .send(payload({ slug: 'tagged-note', tagIds: [tag.body.id] }))
      .expect(201);

    const listed = await agent.get('/api/admin/posts?tag=react').expect(200);
    expect(listed.body.total).toBe(1);
    expect(listed.body.items[0]?.id).toBe(tagged.body.id);
    expect(listed.body.items[0]?.tags).toEqual([
      { id: tag.body.id, slug: 'react', nameEn: 'React' },
    ]);
  });
});
