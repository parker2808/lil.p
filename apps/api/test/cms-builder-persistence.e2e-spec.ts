import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers, userAgent } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const emptyTree = {
  schemaVersion: 1,
  root: { id: 'page-root', type: 'page', responsive: { base: {} }, sections: [] },
};
const seo = {
  seoTitleEn: 'Ideas',
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
};

describe('builder draft persistence over disposable MySQL', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pageId: number;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
    await createTestUsers(app.get(UsersService));
    const page = await prisma.page.create({
      data: { key: 'ideas', title: 'Ideas', locale: 'en', ...seo },
    });
    pageId = page.id;
  });

  afterAll(async () => app?.close());

  it('keeps legacy drafts null, denies guests and users mutations, and preserves decimal revisions', async () => {
    const path = '/api/admin/pages/ideas/builder/draft';
    expect((await prisma.page.findUniqueOrThrow({ where: { id: pageId } })).draftTree).toBeNull();
    await request(app.getHttpServer()).get(path).expect(401);
    const user = await userAgent(app);
    expect((await user.get(path).expect(200)).body).toEqual({
      mode: 'legacy',
      revision: '0',
      tree: null,
    });
    expect(
      (await user.put(path).send({ expectedRevision: '0', tree: emptyTree }).expect(403)).body.code,
    ).toBe('FORBIDDEN');
    const admin = await adminAgent(app);
    const activated = await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(200);
    expect(activated.body).toMatchObject({ mode: 'tree', revision: '1', tree: emptyTree });
    expect((await admin.get(path).expect(200)).body).toEqual(activated.body);
    const stale = await admin
      .put(path)
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(409);
    expect(stale.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '1' });
    expect(
      (await admin.put(path).send({ expectedRevision: '1', tree: emptyTree }).expect(200)).body
        .revision,
    ).toBe('2');
    const stored = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(stored.draftTree).toEqual(emptyTree);
    expect(stored.draftTreeRevision).toBe(2n);
  });

  it('rejects invalid and future trees without changing the draft or revision', async () => {
    const admin = await adminAgent(app);
    const path = '/api/admin/pages/ideas/builder/activate';
    for (const tree of [
      { ...emptyTree, schemaVersion: 99 },
      { ...emptyTree, surprise: true },
    ]) {
      const error = await admin.post(path).send({ expectedRevision: '0', tree }).expect(400);
      expect(error.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        fieldErrors: { tree: expect.any(Array) },
      });
    }
    expect((await prisma.page.findUniqueOrThrow({ where: { id: pageId } })).draftTree).toBeNull();
    await admin.post(path).send({ expectedRevision: '0', tree: emptyTree }).expect(200);
    const before = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    await admin
      .post('/api/admin/pages/ideas/builder/publish')
      .send({ expectedRevision: '1' })
      .expect(409);
    await admin.post('/api/admin/pages/ideas/publish').send({}).expect(409);
    await admin.patch('/api/admin/pages/ideas').send({}).expect(409);
    const after = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(after.draftTree).toEqual(before.draftTree);
    expect(after.draftTreeRevision).toBe(before.draftTreeRevision);
    expect(await prisma.pageVersion.count({ where: { pageId } })).toBe(0);
  });

  it('restores a strict historical tree without altering legacy rows or published pointer', async () => {
    const admin = await adminAgent(app);
    const legacy = await prisma.pageVersion.create({
      data: { pageId, version: 1, snapshot: { seo: {}, blocks: [] } },
    });
    await prisma.page.update({ where: { id: pageId }, data: { publishedVersionId: legacy.id } });
    await admin.post('/api/admin/pages/ideas/versions/1/restore').expect(200);
    await prisma.pageBlock.create({
      data: {
        pageId,
        key: 'prose',
        type: 'prose',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 0,
        props: { body: { en: 'Recover me' } },
      },
    });
    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(200);
    const before = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    await prisma.pageVersion.create({
      data: {
        pageId,
        version: 2,
        snapshot: { format: 'tree', snapshotVersion: 1, seo, tree: emptyTree },
      },
    });
    const blocked = await admin.post('/api/admin/pages/ideas/versions/1/restore').expect(409);
    expect(blocked.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '1' });
    const stale = await admin
      .post('/api/admin/pages/ideas/versions/2/builder/restore')
      .send({ expectedRevision: '0' })
      .expect(409);
    expect(stale.body.code).toBe('CONFLICT');
    await admin
      .post('/api/admin/pages/ideas/versions/2/builder/restore')
      .send({ expectedRevision: '1' })
      .expect(200);
    const restored = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(restored.draftTree).toEqual(emptyTree);
    expect(restored.draftTreeRevision).toBe(2n);
    expect(restored.publishedVersionId).toBe(before.publishedVersionId);
    expect(await prisma.pageBlock.count({ where: { pageId } })).toBe(1);
    expect(
      (await admin.get('/api/admin/pages/ideas/versions/2').expect(200)).body.snapshot.tree,
    ).toEqual(emptyTree);
    const legacyRestore = await admin
      .post('/api/admin/pages/ideas/versions/1/builder/restore')
      .send({ expectedRevision: '2' })
      .expect(200);
    expect(legacyRestore.body).toEqual({ mode: 'legacy', revision: '3', tree: null });
    const legacyRow = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(legacyRow.draftTree).toBeNull();
    expect(legacyRow.draftTreeRevision).toBe(3n);
    expect(legacyRow.publishedVersionId).toBe(before.publishedVersionId);
    expect(await prisma.pageBlock.count({ where: { pageId } })).toBe(0);
  });

  it('rejects unknown stored tree fields and versions without overwriting any state', async () => {
    const admin = await adminAgent(app);
    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(200);
    const before = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    for (const [version, snapshot] of [
      { version: 1, snapshot: { format: 'tree', snapshotVersion: 2, seo, tree: emptyTree } },
      {
        version: 2,
        snapshot: { format: 'tree', snapshotVersion: 1, seo, tree: { ...emptyTree, extra: 1 } },
      },
    ]) {
      await prisma.pageVersion.create({ data: { pageId, version, snapshot } });
      for (const path of [
        `/api/admin/pages/ideas/versions/${version}`,
        `/api/admin/pages/ideas/versions/${version}/builder/restore`,
      ]) {
        const response = path.endsWith('restore')
          ? await admin.post(path).send({ expectedRevision: '1' }).expect(400)
          : await admin.get(path).expect(400);
        expect(response.body).toMatchObject({
          code: 'INVALID_BLOCKS',
          fieldErrors: { snapshot: expect.any(Array) },
        });
      }
    }
    const after = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(after.draftTree).toEqual(before.draftTree);
    expect(after.draftTreeRevision).toBe(before.draftTreeRevision);
    expect(after.publishedVersionId).toBe(before.publishedVersionId);
  });
});
