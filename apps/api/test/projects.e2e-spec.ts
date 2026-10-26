import type { INestApplication } from '@nestjs/common';
import type { ProjectCreateInput } from '@portfolio/contracts';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function payload(over: Partial<ProjectCreateInput> = {}): ProjectCreateInput {
  return {
    slug: 'sample-case',
    titleEn: 'Sample case',
    titleVi: '',
    taglineEn: 'A short tagline',
    taglineVi: '',
    client: 'Sample client',
    roleEn: 'Frontend Engineer',
    roleVi: '',
    startDate: '2024-01-01',
    problemEn: 'Old path',
    problemVi: '',
    constraintsEn: 'No freeze',
    constraintsVi: '',
    approachEn: 'Slice the work',
    approachVi: '',
    decisionsEn: 'Tokens first',
    decisionsVi: '',
    outcomeEn: 'Shipped',
    outcomeVi: '',
    lessonsEn: 'Keep the contract',
    lessonsVi: '',
    keyFactsEn: 'Zero downtime',
    keyFactsVi: '',
    factChipsEn: 'Stack A',
    factChipsVi: '',
    ...over,
  };
}

describe('admin projects', () => {
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

  it('creates, lists, updates, archives a project', async () => {
    const created = await agent.post('/api/admin/projects').send(payload()).expect(201);

    expect(created.body.status).toBe('DRAFT');
    expect(created.body.slug).toBe('sample-case');

    const listed = await agent.get('/api/admin/projects').expect(200);
    expect(listed.body.total).toBe(1);
    expect(listed.body.items[0].slug).toBe('sample-case');

    const updated = await agent
      .patch(`/api/admin/projects/${created.body.id}`)
      .send({ titleEn: 'Renamed case', updatedAt: created.body.updatedAt })
      .expect(200);
    expect(updated.body.titleEn).toBe('Renamed case');

    const archived = await agent.delete(`/api/admin/projects/${created.body.id}`).expect(200);
    expect(archived.body.status).toBe('ARCHIVED');
  });

  it('returns 409 with a slug field error on a duplicate slug', async () => {
    await agent.post('/api/admin/projects').send(payload()).expect(201);
    const duplicate = await agent.post('/api/admin/projects').send(payload()).expect(409);
    expect(duplicate.body.code).toBe('CONFLICT');
    expect(duplicate.body.fieldErrors.slug).toBeDefined();
  });

  it('returns 409 STALE when updatedAt is old', async () => {
    const created = await agent.post('/api/admin/projects').send(payload()).expect(201);

    await agent
      .patch(`/api/admin/projects/${created.body.id}`)
      .send({ titleEn: 'First save', updatedAt: created.body.updatedAt })
      .expect(200);

    const stale = await agent
      .patch(`/api/admin/projects/${created.body.id}`)
      .send({ titleEn: 'Second save', updatedAt: created.body.updatedAt })
      .expect(409);
    expect(stale.body.code).toBe('STALE');
  });

  it('returns 404 for an unknown id', async () => {
    await agent.get('/api/admin/projects/9999').expect(404);
  });

  it('returns 400 for an invalid body', async () => {
    const res = await agent.post('/api/admin/projects').send({ slug: 'Not A Slug' }).expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
  });
});
