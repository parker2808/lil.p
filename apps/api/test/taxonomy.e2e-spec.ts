import type { INestApplication } from '@nestjs/common';
import type { ProjectCreateInput } from '@portfolio/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function projectPayload(over: Partial<ProjectCreateInput> = {}): ProjectCreateInput {
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

describe('admin taxonomy', () => {
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

  it('creates a tag from a name and derives the slug', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/tags')
      .send({ nameEn: 'React 19', nameVi: '' })
      .expect(201);
    expect(created.body.slug).toBe('react-19');

    await request(app.getHttpServer())
      .patch(`/api/admin/tags/${created.body.id}`)
      .send({ nameEn: 'React' })
      .expect(200);

    await request(app.getHttpServer()).delete(`/api/admin/tags/${created.body.id}`).expect(200);
    const listed = await request(app.getHttpServer()).get('/api/admin/tags').expect(200);
    expect(listed.body).toHaveLength(0);
  });

  it('refuses to delete a category that still has skills', async () => {
    const category = await request(app.getHttpServer())
      .post('/api/admin/skill-categories')
      .send({ nameEn: 'Frontend', nameVi: '' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/admin/skills')
      .send({ name: 'React', categoryId: category.body.id, depth: 'DAILY' })
      .expect(201);

    const blocked = await request(app.getHttpServer())
      .delete(`/api/admin/skill-categories/${category.body.id}`)
      .expect(409);
    expect(blocked.body.code).toBe('IN_USE');
  });

  it('clears project.domainId when the domain is deleted', async () => {
    const domain = await request(app.getHttpServer())
      .post('/api/admin/domains')
      .send({
        slug: 'commerce',
        nameEn: 'Commerce',
        nameVi: '',
        descriptionEn: 'Stores',
        descriptionVi: '',
        hue: 'JADE',
        iconKey: 'shopping-bag',
      })
      .expect(201);

    const project = await request(app.getHttpServer())
      .post('/api/admin/projects')
      .send(projectPayload({ domainId: domain.body.id }))
      .expect(201);
    expect(project.body.domainId).toBe(domain.body.id);

    await request(app.getHttpServer()).delete(`/api/admin/domains/${domain.body.id}`).expect(200);

    const after = await request(app.getHttpServer())
      .get(`/api/admin/projects/${project.body.id}`)
      .expect(200);
    expect(after.body.domainId).toBeNull();
  });

  it('returns 400 fieldErrors.iconKey for an unknown icon', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/domains')
      .send({
        slug: 'bad-icon',
        nameEn: 'Bad',
        nameVi: '',
        descriptionEn: '',
        descriptionVi: '',
        hue: 'JADE',
        iconKey: 'not-an-icon',
      })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors.iconKey).toBeDefined();
  });

  it('returns 400 for an invalid body', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/skill-categories')
      .send({ nameEn: '' })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors).toBeDefined();
  });

  it('returns 404 for an unknown skill', async () => {
    await request(app.getHttpServer()).get('/api/admin/skills/9999').expect(404);
  });
});
