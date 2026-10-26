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
    slug: 'audit-case',
    titleEn: 'Audit case',
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

describe('audit', () => {
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

  it('records login and project writes, then lists them for admin only', async () => {
    const admin = await adminAgent(app);
    const created = await admin.post('/api/admin/projects').send(projectPayload()).expect(201);
    await admin
      .patch(`/api/admin/projects/${created.body.id}`)
      .send({ titleEn: 'Audit case edited', updatedAt: created.body.updatedAt })
      .expect(200);
    await admin.post(`/api/admin/projects/${created.body.id}/publish`).expect(200);
    await admin.delete(`/api/admin/projects/${created.body.id}`).expect(200);

    const page = await admin.get('/api/admin/audit?limit=20').expect(200);
    const actions = page.body.items.map((item: { action: string; entityType: string }) => ({
      action: item.action,
      entityType: item.entityType,
    }));
    expect(actions).toEqual(
      expect.arrayContaining([
        { action: 'LOGIN', entityType: 'user' },
        { action: 'CREATE', entityType: 'project' },
        { action: 'UPDATE', entityType: 'project' },
        { action: 'PUBLISH', entityType: 'project' },
        { action: 'ARCHIVE', entityType: 'project' },
      ]),
    );
    expect(page.body.items[0].id).toBeGreaterThan(page.body.items[1].id);

    const filtered = await admin.get('/api/admin/audit?entityType=project&limit=20').expect(200);
    expect(
      filtered.body.items.every((item: { entityType: string }) => item.entityType === 'project'),
    ).toBe(true);

    const reviewer = await userAgent(app);
    await reviewer.get('/api/admin/audit').expect(403);
  });

  it('archives many projects in one transaction with one audit row each', async () => {
    const admin = await adminAgent(app);
    const first = await admin
      .post('/api/admin/projects')
      .send(projectPayload({ slug: 'bulk-one', titleEn: 'Bulk one' }))
      .expect(201);
    const second = await admin
      .post('/api/admin/projects')
      .send(projectPayload({ slug: 'bulk-two', titleEn: 'Bulk two' }))
      .expect(201);

    await admin
      .post('/api/admin/projects/bulk')
      .send({ ids: [first.body.id, second.body.id], action: 'archive' })
      .expect(200);

    const archived = await prisma.project.findMany({
      where: { id: { in: [first.body.id, second.body.id] } },
      select: { status: true },
    });
    expect(archived.every((row) => row.status === 'ARCHIVED')).toBe(true);

    const page = await admin.get('/api/admin/audit?entityType=project&limit=20').expect(200);
    const archives = page.body.items.filter(
      (item: { action: string }) => item.action === 'ARCHIVE',
    );
    expect(archives).toHaveLength(2);
  });
});
