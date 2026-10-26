import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const cases = [
  {
    name: 'education',
    path: '/api/admin/education',
    create: {
      school: 'Example University',
      degreeEn: 'BSc',
      degreeVi: '',
      majorEn: 'Computer Science',
      majorVi: '',
      startDate: '2016-09-01',
      endDate: '2020-06-01',
    },
    patch: { degreeEn: 'BEng' },
    field: 'degreeEn',
    expected: 'BEng',
    invalid: { school: '' },
  },
  {
    name: 'principles',
    path: '/api/admin/principles',
    create: {
      titleEn: 'Contracts first',
      titleVi: '',
      bodyEn: 'Share the DTO before the UI.',
      bodyVi: '',
      iconKey: 'file-check',
    },
    patch: { titleEn: 'Keep the contract' },
    field: 'titleEn',
    expected: 'Keep the contract',
    invalid: { titleEn: '', iconKey: 'not-an-icon' },
  },
  {
    name: 'profile-stats',
    path: '/api/admin/profile-stats',
    create: {
      labelEn: 'Shipped',
      labelVi: '',
      value: '12',
      source: 'MANUAL',
      iconKey: 'rocket',
    },
    patch: { value: '14' },
    field: 'value',
    expected: '14',
    invalid: { labelEn: '', iconKey: 'not-an-icon' },
  },
  {
    name: 'process-steps',
    path: '/api/admin/process-steps',
    create: {
      titleEn: 'Map',
      titleVi: '',
      captionEn: 'Write the contract',
      captionVi: '',
      iconKey: 'route',
    },
    patch: { titleEn: 'Sketch' },
    field: 'titleEn',
    expected: 'Sketch',
    invalid: { titleEn: '', iconKey: 'not-an-icon' },
  },
] as const;

describe('admin about-small entities', () => {
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

  for (const item of cases) {
    describe(item.name, () => {
      it('creates, updates, deletes', async () => {
        const created = await agent.post(item.path).send(item.create).expect(201);

        const listed = await agent.get(item.path).expect(200);
        expect(listed.body).toHaveLength(1);

        const updated = await agent
          .patch(`${item.path}/${created.body.id}`)
          .send(item.patch)
          .expect(200);
        expect(updated.body[item.field]).toBe(item.expected);

        await agent.delete(`${item.path}/${created.body.id}`).expect(200);
        const empty = await agent.get(item.path).expect(200);
        expect(empty.body).toHaveLength(0);
      });

      it('returns 404 for an unknown id', async () => {
        await agent.get(`${item.path}/9999`).expect(404);
      });

      it('returns 400 with fieldErrors for an invalid body', async () => {
        const res = await agent.post(item.path).send(item.invalid).expect(400);
        expect(res.body.code).toBe('VALIDATION_FAILED');
        expect(res.body.fieldErrors).toBeDefined();
      });
    });
  }
});
