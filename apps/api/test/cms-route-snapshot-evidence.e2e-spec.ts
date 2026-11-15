import { createHash } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const legacySnapshot = {
  seo: {},
  blocks: [
    {
      type: 'page-header',
      key: 'page-header',
      schemaVersion: 1,
      props: { title: { en: 'Historical title', vi: 'Tiêu đề cũ' } },
      layout: 'ONE',
      surface: 'PLAIN',
      isVisible: true,
      sortOrder: 0,
    },
  ],
};
const tree = {
  schemaVersion: 1,
  root: {
    id: 'page-root',
    type: 'page',
    responsive: { base: {} },
    sections: [
      {
        id: 'section',
        type: 'section',
        responsive: { base: {} },
        content: [
          {
            id: 'heading',
            type: 'component',
            componentType: 'heading',
            responsive: { base: { text: 'New heading', level: 1 } },
          },
        ],
      },
    ],
  },
};
const treeSnapshot = {
  format: 'tree',
  snapshotVersion: 1,
  seo: {
    seoTitleEn: 'New heading',
    seoTitleVi: 'Tiêu đề mới',
    seoDescriptionEn: null,
    seoDescriptionVi: null,
  },
  tree,
};

function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

describe('V17/V22 legacy and tree route inventory over real HTTP and disposable MySQL', () => {
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

  it('keeps missing-SEO legacy bytes immutable across version/public/preview and draft restore', async () => {
    const page = await prisma.page.create({
      data: { key: 'historical-page', title: 'Historical', locale: 'en', seoTitleEn: 'Draft SEO' },
    });
    const version = await prisma.pageVersion.create({
      data: { pageId: page.id, version: 1, snapshot: legacySnapshot },
    });
    await prisma.page.update({ where: { id: page.id }, data: { publishedVersionId: version.id } });
    const original = hash(version.snapshot);
    const admin = await adminAgent(app);
    const publicServer = request(app.getHttpServer());
    const versionResponse = await admin
      .get('/api/admin/pages/historical-page/versions/1')
      .expect(200);
    expect(versionResponse.body.snapshot.blocks).toEqual(legacySnapshot.blocks);
    expect(versionResponse.body.snapshot.seo).toEqual({
      seoTitleEn: null,
      seoTitleVi: null,
      seoDescriptionEn: null,
      seoDescriptionVi: null,
    });
    for (const locale of ['en', 'vi']) {
      const preview = await admin
        .get(`/api/admin/preview/pages/historical-page?locale=${locale}&version=1`)
        .expect(200);
      const published = await publicServer
        .get(`/api/public/pages/historical-page?locale=${locale}`)
        .expect(200);
      expect(preview.body).toEqual({ ...published.body, invalidBlocks: [] });
      expect(published.body.blocks[0].props.title).toBe(
        locale === 'vi' ? 'Tiêu đề cũ' : 'Historical title',
      );
    }
    const restored = await admin
      .post('/api/admin/pages/historical-page/versions/1/restore')
      .expect(200);
    expect(restored.body.seoTitleEn).toBeNull();
    expect(restored.body.blocks[0].props).toEqual(legacySnapshot.blocks[0].props);
    expect(
      hash((await prisma.pageVersion.findUniqueOrThrow({ where: { id: version.id } })).snapshot),
    ).toBe(original);
    expect(
      (await prisma.page.findUniqueOrThrow({ where: { id: page.id } })).publishedVersionId,
    ).toBe(version.id);
    expect(await prisma.pageVersion.count({ where: { pageId: page.id } })).toBe(1);
  });

  it('inventories tree and legacy version/public/preview routes without rewriting either raw snapshot', async () => {
    const admin = await adminAgent(app);
    const publicServer = request(app.getHttpServer());
    const previous = process.env.CMS_TREE_ROUTES;
    process.env.CMS_TREE_ROUTES = '1';
    try {
      for (const [key, snapshot] of [
        ['historical-page', legacySnapshot],
        ['tree-page', treeSnapshot],
      ] as const) {
        const page = await prisma.page.create({
          data: { key, title: key, locale: 'en', seoTitleEn: key, seoTitleVi: key },
        });
        const version = await prisma.pageVersion.create({
          data: { pageId: page.id, version: 1, snapshot },
        });
        const rawHash = hash(version.snapshot);
        await prisma.page.update({
          where: { id: page.id },
          data: { publishedVersionId: version.id },
        });
        const versionRead = await admin.get(`/api/admin/pages/${key}/versions/1`).expect(200);
        expect(versionRead.body.version).toBe(1);
        for (const locale of ['en', 'vi']) {
          const published = await publicServer
            .get(`/api/public/pages/${key}?locale=${locale}`)
            .expect(200);
          const preview = await admin
            .get(`/api/admin/preview/pages/${key}?locale=${locale}&version=1`)
            .expect(200);
          expect(preview.body).toEqual({ ...published.body, invalidBlocks: [] });
          expect(published.body.key).toBe(key);
          if (key === 'tree-page') expect(published.body.tree).toEqual(tree);
          else expect(published.body.blocks[0].type).toBe('page-header');
        }
        expect(
          hash(
            (await prisma.pageVersion.findUniqueOrThrow({ where: { id: version.id } })).snapshot,
          ),
        ).toBe(rawHash);
        expect(await prisma.pageVersion.count({ where: { pageId: page.id } })).toBe(1);
      }
    } finally {
      if (previous === undefined) delete process.env.CMS_TREE_ROUTES;
      else process.env.CMS_TREE_ROUTES = previous;
    }
  });
});
