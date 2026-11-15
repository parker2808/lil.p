import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const key = 'd6-parity-contract';
const tree = {
  schemaVersion: 1,
  root: {
    id: 'parity-root',
    type: 'page',
    responsive: { base: {} },
    sections: [
      {
        id: 'parity-section',
        type: 'section',
        responsive: { base: {} },
        content: [
          {
            id: 'parity-heading',
            type: 'component',
            componentType: 'heading',
            responsive: { base: { text: 'Tree copy', level: 1 } },
          },
        ],
      },
    ],
  },
};

describe('legacy and tree route/snapshot parity over disposable MySQL', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
    await createTestUsers(app.get(UsersService));
  });

  afterAll(async () => app?.close());

  it('keeps legacy raw bytes and rows across real tree publish while routing both versions', async () => {
    const previous = process.env.CMS_TREE_ROUTES;
    process.env.CMS_TREE_ROUTES = '1';
    try {
      const admin = await adminAgent(app);
      const guest = request(app.getHttpServer());
      const created = await admin
        .post('/api/admin/pages')
        .send({
          key,
          title: 'Parity contract',
          locale: 'en',
          template: 'starter',
        })
        .expect(201);
      const prose = created.body.blocks.find((block: { type: string }) => block.type === 'prose');
      await admin
        .patch(`/api/admin/pages/${key}/blocks/${prose.id}`)
        .send({
          props: { body: { en: 'First legacy copy', vi: 'Bản đầu tiên' } },
        })
        .expect(200);
      await admin.patch(`/api/admin/pages/${key}`).send({ seoTitleVi: 'Tiêu đề VI' }).expect(200);
      await admin.post(`/api/admin/pages/${key}/publish`).send({}).expect(200);

      const row = await prisma.page.findFirstOrThrow({ where: { key } });
      const legacyRows = await prisma.pageBlock.findMany({ where: { pageId: row.id } });
      const legacyVersion = await prisma.pageVersion.findFirstOrThrow({
        where: { pageId: row.id, version: 1 },
      });
      const legacyBytes = JSON.stringify(legacyVersion.snapshot);
      expect(legacyVersion.snapshot).toMatchObject({
        seo: { seoTitleVi: 'Tiêu đề VI' },
        blocks: expect.any(Array),
      });
      const beforeRoutes = await Promise.all([
        admin.get(`/api/admin/pages/${key}`),
        admin.get(`/api/admin/pages/${key}/builder/draft`),
        admin.get(`/api/admin/pages/${key}/versions/1`),
        admin.get(`/api/admin/preview/pages/${key}?locale=vi&version=1`),
        guest.get(`/api/public/pages/${key}?locale=vi`),
      ]);
      expect(beforeRoutes.map((response) => response.status)).toEqual([200, 200, 200, 200, 200]);
      expect(beforeRoutes[1]!.body.mode).toBe('legacy');

      await admin
        .post(`/api/admin/pages/${key}/builder/activate`)
        .send({
          expectedRevision: '0',
          tree,
        })
        .expect(200);
      await admin
        .put(`/api/admin/pages/${key}/builder/draft`)
        .send({
          expectedRevision: '1',
          tree,
        })
        .expect(200);
      const published = await admin
        .post(`/api/admin/pages/${key}/builder/publish`)
        .send({
          expectedRevision: '2',
        })
        .expect(200);
      expect(published.body.publishedVersion).toBe(2);

      const afterRoutes = await Promise.all([
        admin.get(`/api/admin/pages/${key}`),
        admin.get(`/api/admin/pages/${key}/builder/draft`),
        admin.get(`/api/admin/pages/${key}/versions/1`),
        admin.get(`/api/admin/pages/${key}/versions/2`),
        admin.get(`/api/admin/preview/pages/${key}?locale=vi&version=1`),
        admin.get(`/api/admin/preview/pages/${key}?locale=vi&version=2`),
        guest.get(`/api/public/pages/${key}?locale=vi`),
      ]);
      expect(afterRoutes.map((response) => response.status)).toEqual([
        200, 200, 200, 200, 200, 200, 200,
      ]);
      expect(afterRoutes[1]!.body).toMatchObject({ mode: 'tree', revision: '3', tree });
      expect(afterRoutes[2]!.body.snapshot).toEqual(legacyVersion.snapshot);
      expect(afterRoutes[3]!.body.snapshot).toMatchObject({
        format: 'tree',
        snapshotVersion: 1,
        tree,
      });
      expect(afterRoutes[4]!.body.blocks).toEqual(beforeRoutes[3]!.body.blocks);
      expect(afterRoutes[5]!.body).toEqual({ ...afterRoutes[6]!.body, invalidBlocks: [] });
      expect(
        JSON.stringify(
          (await prisma.pageVersion.findUniqueOrThrow({ where: { id: legacyVersion.id } }))
            .snapshot,
        ),
      ).toBe(legacyBytes);
      expect(await prisma.pageBlock.findMany({ where: { pageId: row.id } })).toEqual(legacyRows);
      expect(afterRoutes[2]!.body.snapshot.seo).toEqual(legacyVersion.snapshot.seo);
    } finally {
      if (previous === undefined) delete process.env.CMS_TREE_ROUTES;
      else process.env.CMS_TREE_ROUTES = previous;
    }
  });
});
