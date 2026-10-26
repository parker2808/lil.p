import type { INestApplication } from '@nestjs/common';
import type { ExperienceCreateInput } from '@portfolio/contracts';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function payload(over: Partial<ExperienceCreateInput> = {}): ExperienceCreateInput {
  return {
    company: 'Acme',
    location: 'Remote',
    employmentType: 'FULL_TIME',
    roleEn: 'Frontend Engineer',
    roleVi: '',
    summaryEn: 'Shipped the shell',
    summaryVi: '',
    highlightsEn: 'Tokens first',
    highlightsVi: '',
    startDate: '2024-01-01',
    ...over,
  };
}

describe('admin experience', () => {
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

  it('creates, lists, updates, deletes a role', async () => {
    const created = await agent.post('/api/admin/experience').send(payload()).expect(201);
    expect(created.body.company).toBe('Acme');

    const listed = await agent.get('/api/admin/experience').expect(200);
    expect(listed.body.total).toBe(1);
    expect(listed.body.items).toHaveLength(1);

    const updated = await agent
      .patch(`/api/admin/experience/${created.body.id}`)
      .send({ roleEn: 'Staff Frontend', updatedAt: created.body.updatedAt })
      .expect(200);
    expect(updated.body.roleEn).toBe('Staff Frontend');

    await agent.delete(`/api/admin/experience/${created.body.id}`).expect(200);
    const empty = await agent.get('/api/admin/experience').expect(200);
    expect(empty.body.total).toBe(0);
    expect(empty.body.items).toHaveLength(0);
  });

  it('filters the list by visibility through query params', async () => {
    await agent.post('/api/admin/experience').send(payload()).expect(201);
    const hidden = await agent
      .post('/api/admin/experience')
      .send(payload({ company: 'Hidden Co', isVisible: false, startDate: '2023-01-01' }))
      .expect(201);

    const listed = await agent.get('/api/admin/experience?visible=0').expect(200);
    expect(listed.body.total).toBe(1);
    expect(listed.body.items[0]?.id).toBe(hidden.body.id);
  });

  it('returns 409 STALE when updatedAt is old', async () => {
    const created = await agent.post('/api/admin/experience').send(payload()).expect(201);

    await agent
      .patch(`/api/admin/experience/${created.body.id}`)
      .send({ roleEn: 'First save', updatedAt: created.body.updatedAt })
      .expect(200);

    const stale = await agent
      .patch(`/api/admin/experience/${created.body.id}`)
      .send({ roleEn: 'Second save', updatedAt: created.body.updatedAt })
      .expect(409);
    expect(stale.body.code).toBe('STALE');
  });

  it('returns 404 for an unknown id', async () => {
    await agent.get('/api/admin/experience/9999').expect(404);
  });

  it('returns 400 for an invalid body', async () => {
    const res = await agent.post('/api/admin/experience').send({ company: '' }).expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors).toBeDefined();
  });
});
