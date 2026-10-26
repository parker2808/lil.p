import type { INestApplication } from '@nestjs/common';
import type { ExperienceCreateInput } from '@portfolio/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { PrismaService } from '../src/prisma/prisma.service';
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

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, lists, updates, deletes a role', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/experience')
      .send(payload())
      .expect(201);
    expect(created.body.company).toBe('Acme');

    const listed = await request(app.getHttpServer()).get('/api/admin/experience').expect(200);
    expect(listed.body).toHaveLength(1);

    const updated = await request(app.getHttpServer())
      .patch(`/api/admin/experience/${created.body.id}`)
      .send({ roleEn: 'Staff Frontend', updatedAt: created.body.updatedAt })
      .expect(200);
    expect(updated.body.roleEn).toBe('Staff Frontend');

    await request(app.getHttpServer())
      .delete(`/api/admin/experience/${created.body.id}`)
      .expect(200);
    const empty = await request(app.getHttpServer()).get('/api/admin/experience').expect(200);
    expect(empty.body).toHaveLength(0);
  });

  it('returns 409 STALE when updatedAt is old', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/experience')
      .send(payload())
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/admin/experience/${created.body.id}`)
      .send({ roleEn: 'First save', updatedAt: created.body.updatedAt })
      .expect(200);

    const stale = await request(app.getHttpServer())
      .patch(`/api/admin/experience/${created.body.id}`)
      .send({ roleEn: 'Second save', updatedAt: created.body.updatedAt })
      .expect(409);
    expect(stale.body.code).toBe('STALE');
  });

  it('returns 404 for an unknown id', async () => {
    await request(app.getHttpServer()).get('/api/admin/experience/9999').expect(404);
  });

  it('returns 400 for an invalid body', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/experience')
      .send({ company: '' })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors).toBeDefined();
  });
});
