import type { INestApplication } from '@nestjs/common';
import type { ProjectCreateInput } from '@portfolio/contracts';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers, userAgent } from './helpers/auth.helper';
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

describe('admin dashboard', () => {
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

  it('lets a user read empty stats and the marquee health check', async () => {
    const agent = await userAgent(app);
    const stats = await agent.get('/api/admin/stats').expect(200);
    expect(stats.body).toEqual({
      range: '30d',
      projects: {
        draft: 0,
        published: 0,
        archived: 0,
        publishedInRange: 0,
        publishedInPrevious: 0,
      },
      posts: {
        draft: 0,
        published: 0,
        archived: 0,
        publishedInRange: 0,
        publishedInPrevious: 0,
      },
      messages: { unread: 0 },
      views: expect.objectContaining({
        total: 0,
        uniqueVisitors: 0,
        previousTotal: 0,
        previousUnique: 0,
        topPages: [],
        topReferrers: [],
      }),
    });
    expect(stats.body.views.byDay.length).toBeGreaterThan(0);

    const health = await agent.get('/api/admin/health').expect(200);
    expect(health.body.summary.marqueeCount).toBe(0);
    expect(health.body.issues).toEqual([
      {
        kind: 'MARQUEE_SKILLS',
        entity: 'skill',
        id: null,
        title: '',
        href: '/admin/skills',
        count: 0,
      },
    ]);
  });

  it('rejects an unknown range', async () => {
    const agent = await adminAgent(app);
    const res = await agent.get('/api/admin/stats?range=1y').expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors.range).toBeDefined();
  });

  it('counts published items in the requested window and lists v2 health issues', async () => {
    const agent = await adminAgent(app);
    const project = await agent.post('/api/admin/projects').send(projectPayload()).expect(201);
    const post = await agent
      .post('/api/admin/posts')
      .send({
        slug: 'draft-note',
        titleEn: 'Draft note',
        titleVi: '',
        excerptEn: 'A short excerpt',
        excerptVi: '',
        bodyEn: 'TODO: finish this note',
        bodyVi: '',
        takeawaysEn: 'Keep the contract',
        takeawaysVi: '',
      })
      .expect(201);

    const category = await agent
      .post('/api/admin/skill-categories')
      .send({ nameEn: 'Frontend', nameVi: '' })
      .expect(201);
    await agent
      .post('/api/admin/skills')
      .send({
        name: 'React',
        categoryId: category.body.id,
        depth: 'DAILY',
        showInMarquee: true,
      })
      .expect(201);

    await prisma.project.update({
      where: { id: project.body.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    const stats = await agent.get('/api/admin/stats?range=30d').expect(200);
    expect(stats.body.range).toBe('30d');
    expect(stats.body.projects).toMatchObject({
      draft: 0,
      published: 1,
      archived: 0,
      publishedInRange: 1,
    });
    expect(stats.body.posts).toMatchObject({ draft: 1, published: 0, archived: 0 });

    const health = await agent.get('/api/admin/health').expect(200);
    expect(health.body.summary).toMatchObject({
      drafts: 1,
      missingVi: 1,
      noDomain: 1,
      fewKeyFacts: 1,
      marqueeCount: 1,
      publishLint: 1,
    });
    const kinds = health.body.issues.map((issue: { kind: string }) => issue.kind);
    expect(kinds).toEqual([
      'PROJECT_NO_DOMAIN',
      'CASE_STUDY_KEY_FACTS',
      'MISSING_VI',
      'PUBLISH_LINT',
      'MARQUEE_SKILLS',
    ]);
    expect(health.body.issues[0]).toMatchObject({
      href: `/admin/projects/${project.body.id}`,
      title: 'Sample case',
    });
    expect(
      health.body.issues.find((issue: { kind: string }) => issue.kind === 'PUBLISH_LINT'),
    ).toMatchObject({
      href: `/admin/posts/${post.body.id}`,
      title: 'Draft note',
      fields: ['bodyEn'],
    });
  });
});
