import type { INestApplication } from '@nestjs/common';
import type { PostCreateInput, ProjectCreateInput } from '@portfolio/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function projectPayload(over: Partial<ProjectCreateInput> = {}): ProjectCreateInput {
  return {
    slug: 'live-case',
    titleEn: 'Live case',
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
    slug: 'live-note',
    titleEn: 'Live note',
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

describe('public sitemap', () => {
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

  it('lists published slugs only', async () => {
    const admin = await adminAgent(app);
    const liveProject = await admin.post('/api/admin/projects').send(projectPayload()).expect(201);
    await admin.post(`/api/admin/projects/${liveProject.body.id}/publish`).expect(200);
    await admin
      .post('/api/admin/projects')
      .send(projectPayload({ slug: 'draft-case', titleEn: 'Draft case' }))
      .expect(201);

    const livePost = await admin.post('/api/admin/posts').send(postPayload()).expect(201);
    await admin.post(`/api/admin/posts/${livePost.body.id}/publish`).expect(200);
    await admin
      .post('/api/admin/posts')
      .send(postPayload({ slug: 'draft-note', titleEn: 'Draft note' }))
      .expect(201);

    const response = await request(app.getHttpServer()).get('/api/public/sitemap').expect(200);
    const paths = (response.body.entries as { path: string }[]).map((entry) => entry.path);

    expect(paths).toContain('/projects/live-case');
    expect(paths).toContain('/notes/live-note');
    expect(paths).not.toContain('/projects/draft-case');
    expect(paths).not.toContain('/notes/draft-note');
  });
});
