import type { INestApplication } from '@nestjs/common';
import type { PostCreateInput, ProjectCreateInput } from '@portfolio/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers, userAgent } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function projectPayload(over: Partial<ProjectCreateInput> = {}): ProjectCreateInput {
  return {
    slug: 'publish-case',
    titleEn: 'Publish case',
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

function postPayload(over: Partial<PostCreateInput> = {}): PostCreateInput {
  return {
    slug: 'publish-note',
    titleEn: 'Publish note',
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

describe('publishing', () => {
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

  it('keeps a draft off the public URL and shows it in preview', async () => {
    const admin = await adminAgent(app);
    await admin.post('/api/admin/projects').send(projectPayload()).expect(201);

    await request(app.getHttpServer()).get('/api/public/projects/publish-case').expect(404);

    const preview = await admin.get('/api/admin/preview/projects/publish-case').expect(200);
    expect(preview.body.slug).toBe('publish-case');
    expect(preview.body.title).toBe('Publish case');
  });

  it('publishes a project then unpublishes it', async () => {
    const admin = await adminAgent(app);
    const created = await admin.post('/api/admin/projects').send(projectPayload()).expect(201);

    const published = await admin
      .post(`/api/admin/projects/${created.body.id}/publish`)
      .expect(200);
    expect(published.body.status).toBe('PUBLISHED');
    expect(published.body.publishedAt).toBeTruthy();

    const publicRow = await request(app.getHttpServer())
      .get('/api/public/projects/publish-case')
      .expect(200);
    expect(publicRow.body.title).toBe('Publish case');

    const firstPublishedAt = published.body.publishedAt;
    const again = await admin.post(`/api/admin/projects/${created.body.id}/publish`).expect(200);
    expect(again.body.publishedAt).toBe(firstPublishedAt);

    await admin.post(`/api/admin/projects/${created.body.id}/unpublish`).expect(200);
    await request(app.getHttpServer()).get('/api/public/projects/publish-case').expect(404);
  });

  it('rejects publishing a post that contains TODO', async () => {
    const admin = await adminAgent(app);
    const created = await admin
      .post('/api/admin/posts')
      .send(postPayload({ bodyEn: 'TODO: finish this note' }))
      .expect(201);

    const failed = await admin.post(`/api/admin/posts/${created.body.id}/publish`).expect(400);
    expect(failed.body.code).toBe('VALIDATION_FAILED');
    expect(failed.body.fieldErrors.bodyEn).toEqual(
      expect.arrayContaining(['Must not contain TODO']),
    );
  });

  it('lets a user preview and forbids publish', async () => {
    const admin = await adminAgent(app);
    const created = await admin.post('/api/admin/posts').send(postPayload()).expect(201);
    const user = await userAgent(app);

    await user.get('/api/admin/preview/posts/publish-note').expect(200);
    const forbidden = await user.post(`/api/admin/posts/${created.body.id}/publish`).expect(403);
    expect(forbidden.body.code).toBe('FORBIDDEN');
  });
});
