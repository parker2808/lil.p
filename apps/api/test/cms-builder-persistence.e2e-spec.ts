import { createHash } from 'node:crypto';

import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PageVersionsService } from '../src/modules/pages/page-versions.service';
import { PagesService } from '../src/modules/pages/pages.service';
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

const section = {
  id: 'section',
  type: 'section',
  responsive: { base: {} },
  content: [] as unknown[],
};
const heading = {
  id: 'heading',
  type: 'component',
  componentType: 'heading',
  responsive: { base: { text: 'Safe heading', level: 1 } },
};
const treeWith = (content: unknown[]) => ({
  schemaVersion: 1,
  root: { ...emptyTree.root, sections: [{ ...section, content }] },
});
const invalidTrees = [
  ['future version', { ...emptyTree, schemaVersion: 2 }],
  ['unknown field', { ...emptyTree, extra: true }],
  ['unknown component', treeWith([{ ...heading, componentType: 'future-component' }])],
  ['duplicate IDs', treeWith([heading, { ...heading }])],
  [
    'unsafe rich text',
    treeWith([
      heading,
      {
        id: 'rich-text',
        type: 'component',
        componentType: 'rich-text',
        responsive: { base: { text: '<script>unsafe</script>' } },
      },
    ]),
  ],
  [
    'unsafe URL',
    treeWith([
      heading,
      {
        id: 'button',
        type: 'component',
        componentType: 'button',
        responsive: { base: { label: 'Unsafe', href: 'javascript:alert(1)' } },
      },
    ]),
  ],
  [
    'invalid responsive override',
    treeWith([
      {
        ...heading,
        responsive: {
          ...heading.responsive,
          mobile: { level: 7 },
        },
      },
    ]),
  ],
  [
    'unknown breakpoint',
    treeWith([
      {
        ...heading,
        responsive: {
          ...heading.responsive,
          television: { level: 1 },
        },
      },
    ]),
  ],
  [
    'too many nodes',
    {
      ...emptyTree,
      root: {
        ...emptyTree.root,
        sections: Array.from({ length: 500 }, (_, index) => ({
          ...section,
          id: `section-${index}`,
        })),
      },
    },
  ],
  [
    'too deep',
    treeWith([
      {
        id: 'row',
        type: 'row',
        responsive: { base: {} },
        columns: [
          {
            id: 'column',
            type: 'column',
            responsive: { base: { span: 1 } },
            content: [{ ...heading, content: [{ ...heading, id: 'nested' }] }],
          },
        ],
      },
    ]),
  ],
] as const;

const rawHash = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

async function persistedState(prisma: PrismaService, pageId: number) {
  const page = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
  return {
    revision: page.draftTreeRevision,
    tree: page.draftTree,
    pointer: page.publishedVersionId,
    seo: [page.seoTitleEn, page.seoTitleVi, page.seoDescriptionEn, page.seoDescriptionVi],
    blocks: await prisma.pageBlock.findMany({ where: { pageId }, orderBy: { id: 'asc' } }),
    versions: (
      await prisma.pageVersion.findMany({ where: { pageId }, orderBy: { id: 'asc' } })
    ).map((version) => [version.id, rawHash(version.snapshot)]),
    audit: await prisma.auditLog.findMany({ where: { entityType: 'page', entityId: page.key } }),
  };
}

async function activateAfterPageRead<Result>(
  service: PageVersionsService | PagesService,
  activate: () => Promise<unknown>,
  operation: () => Promise<Result>,
): Promise<Result> {
  const reader = service as unknown as {
    requirePage: (client: PrismaService, key: string) => Promise<unknown>;
  };
  const readFromDb = reader.requirePage.bind(service);
  let activated = false;
  const spy = vi.spyOn(reader, 'requirePage').mockImplementation(async (client, key) => {
    const page = await readFromDb(client, key);
    if (!activated) {
      activated = true;
      await activate();
    }
    return page;
  });
  try {
    const result = await operation();
    expect(activated).toBe(true);
    return result;
  } finally {
    spy.mockRestore();
  }
}

async function seedLegacyBlocks(prisma: PrismaService, pageId: number) {
  await prisma.pageBlock.create({
    data: {
      pageId,
      key: 'header',
      type: 'page-header',
      schemaVersion: 1,
      layout: 'ONE',
      surface: 'PLAIN',
      sortOrder: 0,
      props: { eyebrow: { en: 'Ideas', vi: '' }, title: { en: 'Ideas', vi: '' } },
    },
  });
  return prisma.pageBlock.create({
    data: {
      pageId,
      key: 'prose',
      type: 'prose',
      schemaVersion: 1,
      layout: 'ONE',
      surface: 'PLAIN',
      sortOrder: 1,
      props: { body: { en: 'Substantive original content for this page.', vi: '' } },
    },
  });
}

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

  it.each(invalidTrees)(
    'rejects %s on activation, save and stored publish without changing database state',
    async (_reason, invalidTree) => {
      const admin = await adminAgent(app);
      await seedLegacyBlocks(prisma, pageId);
      const version = await prisma.pageVersion.create({
        data: { pageId, version: 1, snapshot: { seo: {}, blocks: [] } },
      });
      await prisma.page.update({
        where: { id: pageId },
        data: { publishedVersionId: version.id },
      });
      const initial = await persistedState(prisma, pageId);
      const activate = await admin
        .post('/api/admin/pages/ideas/builder/activate')
        .send({ expectedRevision: '0', tree: invalidTree })
        .expect(400);
      expect(activate.body).toMatchObject({ code: 'VALIDATION_FAILED' });
      expect(await persistedState(prisma, pageId)).toEqual(initial);

      await admin
        .post('/api/admin/pages/ideas/builder/activate')
        .send({ expectedRevision: '0', tree: emptyTree })
        .expect(200);
      const beforeSave = await persistedState(prisma, pageId);
      const save = await admin
        .put('/api/admin/pages/ideas/builder/draft')
        .send({ expectedRevision: '1', tree: invalidTree })
        .expect(400);
      expect(save.body).toMatchObject({ code: 'VALIDATION_FAILED' });
      expect(await persistedState(prisma, pageId)).toEqual(beforeSave);

      await prisma.page.update({ where: { id: pageId }, data: { draftTree: invalidTree } });
      const beforePublish = await persistedState(prisma, pageId);
      const publish = await admin
        .post('/api/admin/pages/ideas/builder/publish')
        .send({ expectedRevision: '1' })
        .expect(400);
      expect(publish.body).toMatchObject({ code: 'INVALID_BLOCKS' });
      expect(await persistedState(prisma, pageId)).toEqual(beforePublish);
    },
  );

  it('rejects oversized save bodies and incomplete publish without changing pointer or audit', async () => {
    const admin = await adminAgent(app);
    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(200);
    const before = await persistedState(prisma, pageId);
    const oversized = await admin
      .put('/api/admin/pages/ideas/builder/draft')
      .send({
        expectedRevision: '1',
        tree: treeWith([
          { ...heading, responsive: { base: { text: 'a'.repeat(260_000), level: 1 } } },
        ]),
      })
      .expect(413);
    expect(oversized.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      requestId: expect.any(String),
      fieldErrors: { body: ['Request body too large'] },
    });
    expect(oversized.headers['x-request-id']).toBe(oversized.body.requestId);
    expect(await persistedState(prisma, pageId)).toEqual(before);
    const publish = await admin
      .post('/api/admin/pages/ideas/builder/publish')
      .send({ expectedRevision: '1' })
      .expect(400);
    expect(publish.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      fieldErrors: {
        tree: [expect.stringContaining('HEADING_RULE')],
      },
    });
    expect(await persistedState(prisma, pageId)).toEqual(before);
  });

  it('preserves raw historical snapshots and nested legacy data across reads and restores', async () => {
    const admin = await adminAgent(app);
    await seedLegacyBlocks(prisma, pageId);
    const legacySnapshot = { seo: { seoTitleVi: 'Lưu trữ' }, blocks: [] };
    const nested = { future: { nested: [{ keep: 'raw-value', number: 12 }] } };
    const tree = treeWith([
      {
        id: 'legacy',
        type: 'legacy-component',
        responsive: {
          base: { block: { type: 'future-block', props: nested } },
        },
      },
    ]);
    const legacy = await prisma.pageVersion.create({
      data: { pageId, version: 1, snapshot: legacySnapshot },
    });
    const treeVersion = await prisma.pageVersion.create({
      data: { pageId, version: 2, snapshot: { format: 'tree', snapshotVersion: 1, seo, tree } },
    });
    await prisma.page.update({
      where: { id: pageId },
      data: { publishedVersionId: legacy.id },
    });
    const hashes = [rawHash(legacy.snapshot), rawHash(treeVersion.snapshot)];
    const before = await persistedState(prisma, pageId);
    const historicalVersion = await admin.get('/api/admin/pages/ideas/versions/1').expect(200);
    expect(historicalVersion.body.snapshot).toEqual({
      seo: {
        seoTitleEn: null,
        seoTitleVi: 'Lưu trữ',
        seoDescriptionEn: null,
        seoDescriptionVi: null,
      },
      blocks: [],
    });
    const historicalPreview = await admin
      .get('/api/admin/preview/pages/ideas?locale=vi&version=1')
      .expect(200);
    expect(historicalPreview.body).toMatchObject({
      seo: { title: 'Lưu trữ', lang: 'vi' },
      blocks: [],
      invalidBlocks: [],
    });
    expect(
      rawHash((await prisma.pageVersion.findUniqueOrThrow({ where: { id: legacy.id } })).snapshot),
    ).toBe(hashes[0]);
    expect(
      (await admin.get('/api/admin/pages/ideas/versions/2').expect(200)).body.snapshot.tree,
    ).toEqual(tree);
    await admin.get('/api/admin/preview/pages/ideas?locale=en&version=2').expect(400);
    expect(await persistedState(prisma, pageId)).toEqual(before);

    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree })
      .expect(200);
    const activated = await persistedState(prisma, pageId);
    await admin
      .post('/api/admin/pages/ideas/versions/2/builder/restore')
      .send({ expectedRevision: '1' })
      .expect(200);
    const treeRestored = await persistedState(prisma, pageId);
    expect(treeRestored.tree).toEqual(tree);
    expect(treeRestored.blocks).toEqual(activated.blocks);
    expect(treeRestored.pointer).toBe(legacy.id);
    expect(treeRestored.versions.map((entry) => entry[1])).toEqual(hashes);
    expect((await admin.get('/api/admin/pages/ideas/builder/draft').expect(200)).body.tree).toEqual(
      tree,
    );

    await admin
      .post('/api/admin/pages/ideas/versions/1/builder/restore')
      .send({ expectedRevision: '2' })
      .expect(200);
    const legacyRestored = await persistedState(prisma, pageId);
    expect(legacyRestored.tree).toBeNull();
    expect(legacyRestored.pointer).toBe(legacy.id);
    expect(legacyRestored.revision).toBe(3n);
    expect(legacyRestored.versions.map((entry) => entry[1])).toEqual(hashes);
    expect(legacyRestored.blocks).toEqual([]);
  });

  it('denies every builder mutation to guests and users without logging payloads', async () => {
    const admin = await adminAgent(app);
    const user = await userAgent(app);
    await prisma.pageVersion.create({
      data: { pageId, version: 1, snapshot: { seo: {}, blocks: [] } },
    });
    const before = await persistedState(prisma, pageId);
    const paths = [
      ['post', '/api/admin/pages/ideas/builder/activate'],
      ['put', '/api/admin/pages/ideas/builder/draft'],
      ['post', '/api/admin/pages/ideas/builder/publish'],
      ['post', '/api/admin/pages/ideas/versions/1/builder/restore'],
    ] as const;
    for (const [method, path] of paths) {
      const body = { expectedRevision: '0', tree: emptyTree };
      const guest = await request(app.getHttpServer())[method](path).send(body).expect(401);
      const denied = await user[method](path).send(body).expect(403);
      expect(guest.body).toMatchObject({ code: 'UNAUTHENTICATED' });
      expect(denied.body).toMatchObject({ code: 'FORBIDDEN' });
      expect(JSON.stringify(guest.body) + JSON.stringify(denied.body)).not.toContain('page-root');
    }
    const marker = 'private-marker-not-a-secret';
    const rejected = await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: { ...emptyTree, marker } })
      .expect(400);
    expect(rejected.body).toMatchObject({ code: 'VALIDATION_FAILED' });
    expect(JSON.stringify(rejected.body)).not.toContain(marker);
    expect(await persistedState(prisma, pageId)).toEqual(before);
  });

  it('checks draft, preview and version read capabilities separately from every write', async () => {
    const admin = await adminAgent(app);
    const user = await userAgent(app);
    await seedLegacyBlocks(prisma, pageId);
    const blocks = await prisma.pageBlock.findMany({
      where: { pageId },
      orderBy: { sortOrder: 'asc' },
    });
    const version = await prisma.pageVersion.create({
      data: {
        pageId,
        version: 1,
        snapshot: {
          seo,
          blocks: blocks.map(
            ({ type, key, schemaVersion, layout, surface, sortOrder, isVisible, props }) => ({
              type,
              key,
              schemaVersion,
              layout,
              surface,
              sortOrder,
              isVisible,
              props,
            }),
          ),
        },
      },
    });
    await prisma.page.update({
      where: { id: pageId },
      data: { publishedVersionId: version.id },
    });
    const tree = treeWith([heading]);
    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree })
      .expect(200);
    const before = await persistedState(prisma, pageId);
    const reads = [
      '/api/admin/pages/ideas/builder/draft',
      '/api/admin/pages/ideas/versions',
      '/api/admin/pages/ideas/versions/1',
      '/api/admin/preview/pages/ideas?locale=en&version=1',
    ];
    for (const [index, path] of reads.entries()) {
      const guest = await request(app.getHttpServer()).get(path).expect(401);
      expect(guest.body).toMatchObject({ code: 'UNAUTHENTICATED' });
      for (const actor of [user, admin]) {
        const { body } = await actor.get(path).expect(200);
        if (index === 0) expect(body.tree).toEqual(tree);
        if (index === 1)
          expect(body).toEqual([expect.objectContaining({ version: 1, blockCount: 2 })]);
        if (index === 2) expect(body.snapshot.blocks).toHaveLength(2);
        if (index === 3) expect(body.blocks).toHaveLength(2);
      }
    }
    for (const [method, path, body] of [
      ['post', '/api/admin/pages', { key: 'denied-create', title: 'Denied', locale: 'en' }],
      [
        'post',
        '/api/admin/pages/ideas/builder/activate',
        { expectedRevision: '0', tree: emptyTree },
      ],
      ['put', '/api/admin/pages/ideas/builder/draft', { expectedRevision: '0', tree: emptyTree }],
      ['post', '/api/admin/pages/ideas/builder/publish', { expectedRevision: '0' }],
      ['post', '/api/admin/pages/ideas/versions/1/builder/restore', { expectedRevision: '0' }],
    ] as const) {
      expect(
        (await request(app.getHttpServer())[method](path).send(body).expect(401)).body,
      ).toMatchObject({
        code: 'UNAUTHENTICATED',
      });
      expect((await user[method](path).send(body).expect(403)).body).toMatchObject({
        code: 'FORBIDDEN',
      });
    }
    expect(await persistedState(prisma, pageId)).toEqual(before);
    expect(await prisma.page.findUnique({ where: { key: 'denied-create' } })).toBeNull();
  });

  it('does not echo rejected page content in HTTP errors', async () => {
    const admin = await adminAgent(app);
    const marker = 'private-body-marker-not-a-secret';
    const response = await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: { ...emptyTree, marker } })
      .expect(400);
    expect(JSON.stringify(response.body)).not.toContain(marker);
  });

  it('rolls back legacy publish when a real DB activation wins after the page read', async () => {
    await seedLegacyBlocks(prisma, pageId);
    const admin = await adminAgent(app);
    const response = await activateAfterPageRead(
      app.get(PageVersionsService),
      () =>
        admin
          .post('/api/admin/pages/ideas/builder/activate')
          .send({ expectedRevision: '0', tree: emptyTree })
          .expect(200),
      () => admin.post('/api/admin/pages/ideas/publish').send({ note: 'losing publish' }),
    );
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '1' });
    const page = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(page.draftTree).toEqual(emptyTree);
    expect(page.draftTreeRevision).toBe(1n);
    expect(page.publishedVersionId).toBeNull();
    expect(await prisma.pageVersion.count({ where: { pageId } })).toBe(0);
    expect(
      await prisma.auditLog.count({
        where: { entityType: 'page', entityId: 'ideas', action: 'PUBLISH' },
      }),
    ).toBe(0);
    expect(await prisma.pageBlock.count({ where: { pageId } })).toBe(2);
  });

  it('rolls back legacy delete when a real DB activation wins after the page read', async () => {
    const block = await seedLegacyBlocks(prisma, pageId);
    const admin = await adminAgent(app);
    const response = await activateAfterPageRead(
      app.get(PagesService),
      () =>
        admin
          .post('/api/admin/pages/ideas/builder/activate')
          .send({ expectedRevision: '0', tree: emptyTree })
          .expect(200),
      () => admin.delete(`/api/admin/pages/ideas/blocks/${block.id}`),
    );
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '1' });
    const page = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(page.draftTree).toEqual(emptyTree);
    expect(page.draftTreeRevision).toBe(1n);
    expect(await prisma.pageBlock.count({ where: { pageId } })).toBe(2);
    expect(await prisma.pageBlock.findUnique({ where: { id: block.id } })).not.toBeNull();
    expect(
      await prisma.auditLog.count({
        where: { entityType: 'page', entityId: 'ideas', action: 'ARCHIVE' },
      }),
    ).toBe(0);
  });

  it('reports the winning revision without changing SEO after a lost activation race', async () => {
    const admin = await adminAgent(app);
    const response = await activateAfterPageRead(
      app.get(PagesService),
      () =>
        admin
          .post('/api/admin/pages/ideas/builder/activate')
          .send({ expectedRevision: '0', tree: emptyTree })
          .expect(200),
      () => admin.patch('/api/admin/pages/ideas').send({ seoTitleEn: 'Losing SEO' }),
    );
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '1' });
    const page = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(page.draftTree).toEqual(emptyTree);
    expect(page.draftTreeRevision).toBe(1n);
    expect(page.seoTitleEn).toBe(seo.seoTitleEn);
    expect(await prisma.auditLog.count({ where: { entityType: 'page', entityId: 'ideas' } })).toBe(
      0,
    );
  });

  it.each(['reorder', 'create', 'update', 'duplicate'] as const)(
    'rolls back legacy block %s and reports the winning revision',
    async (mutation) => {
      const prose = await seedLegacyBlocks(prisma, pageId);
      const header = await prisma.pageBlock.findFirstOrThrow({
        where: { pageId, key: 'header' },
      });
      const extra =
        mutation === 'reorder'
          ? await prisma.pageBlock.create({
              data: {
                pageId,
                key: 'prose-extra',
                type: 'prose',
                schemaVersion: 1,
                layout: 'ONE',
                surface: 'PLAIN',
                sortOrder: 2,
                props: { body: { en: 'Another substantive paragraph.', vi: '' } },
              },
            })
          : null;
      const before = await prisma.pageBlock.findMany({ where: { pageId }, orderBy: { id: 'asc' } });
      const admin = await adminAgent(app);
      const response = await activateAfterPageRead(
        app.get(PagesService),
        () =>
          admin
            .post('/api/admin/pages/ideas/builder/activate')
            .send({ expectedRevision: '0', tree: emptyTree })
            .expect(200),
        () => {
          switch (mutation) {
            case 'reorder':
              if (!extra) throw new Error('Reorder requires the third block');
              return admin
                .patch('/api/admin/pages/ideas/blocks/order')
                .send({ ids: [header.id, extra.id, prose.id] });
            case 'create':
              return admin
                .post('/api/admin/pages/ideas/blocks')
                .send({ type: 'prose', afterId: prose.id });
            case 'update':
              return admin
                .patch(`/api/admin/pages/ideas/blocks/${prose.id}`)
                .send({ isVisible: false });
            case 'duplicate':
              return admin.post(`/api/admin/pages/ideas/blocks/${prose.id}/duplicate`);
          }
        },
      );
      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '1' });
      const page = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
      expect(page.draftTree).toEqual(emptyTree);
      expect(page.draftTreeRevision).toBe(1n);
      expect(
        await prisma.pageBlock.findMany({ where: { pageId }, orderBy: { id: 'asc' } }),
      ).toEqual(before);
      expect(
        await prisma.auditLog.count({ where: { entityType: 'page', entityId: 'ideas' } }),
      ).toBe(0);
    },
  );

  it('reports the winning save revision without restoring over a tree draft', async () => {
    const admin = await adminAgent(app);
    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(200);
    const historicalTree = {
      ...emptyTree,
      root: { ...emptyTree.root, id: 'historical-root' },
    };
    const winningTree = { ...emptyTree, root: { ...emptyTree.root, id: 'winning-root' } };
    await prisma.pageVersion.create({
      data: {
        pageId,
        version: 1,
        snapshot: { format: 'tree', snapshotVersion: 1, seo, tree: historicalTree },
      },
    });
    const response = await activateAfterPageRead(
      app.get(PageVersionsService),
      () =>
        admin
          .put('/api/admin/pages/ideas/builder/draft')
          .send({ expectedRevision: '1', tree: winningTree })
          .expect(200),
      () =>
        admin
          .post('/api/admin/pages/ideas/versions/1/builder/restore')
          .send({ expectedRevision: '1' }),
    );
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '2' });
    const page = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(page.draftTree).toEqual(winningTree);
    expect(page.draftTreeRevision).toBe(2n);
    expect(page.seoTitleEn).toBe(seo.seoTitleEn);
    expect(await prisma.pageBlock.count({ where: { pageId } })).toBe(0);
    expect(await prisma.pageVersion.count({ where: { pageId } })).toBe(1);
    expect(await prisma.auditLog.count({ where: { entityType: 'page', entityId: 'ideas' } })).toBe(
      0,
    );
  });

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
      .expect(400);
    await admin.post('/api/admin/pages/ideas/publish').send({}).expect(409);
    await admin.patch('/api/admin/pages/ideas').send({}).expect(409);
    const after = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(after.draftTree).toEqual(before.draftTree);
    expect(after.draftTreeRevision).toBe(before.draftTreeRevision);
    expect(await prisma.pageVersion.count({ where: { pageId } })).toBe(0);
  });

  it('allows only one of two simultaneous saves with the same revision', async () => {
    const admin = await adminAgent(app);
    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(200);
    const variants = ['first', 'second'].map((id) => ({
      ...emptyTree,
      root: { ...emptyTree.root, id },
    }));
    const results = await Promise.all(
      variants.map((tree) =>
        admin.put('/api/admin/pages/ideas/builder/draft').send({ expectedRevision: '1', tree }),
      ),
    );
    expect(results.map((result) => result.status).sort()).toEqual([200, 409]);
    expect(results.find((result) => result.status === 409)?.body).toMatchObject({
      code: 'CONFLICT',
      mode: 'tree',
      revision: '2',
    });
    const saved = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(saved.draftTreeRevision).toBe(2n);
    expect(variants).toContainEqual(saved.draftTree);
  });

  it('races legacy restore with activation without losing the winning draft', async () => {
    const admin = await adminAgent(app);
    await prisma.pageVersion.create({
      data: { pageId, version: 1, snapshot: { seo: {}, blocks: [] } },
    });
    const [restore, activate] = await Promise.all([
      admin.post('/api/admin/pages/ideas/versions/1/restore'),
      admin
        .post('/api/admin/pages/ideas/builder/activate')
        .send({ expectedRevision: '0', tree: emptyTree }),
    ]);
    expect([restore.status, activate.status].sort()).toEqual([200, 409]);
    const saved = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(saved.draftTreeRevision).toBe(1n);
    if (activate.status === 200) {
      expect(saved.draftTree).toEqual(emptyTree);
      expect(restore.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '1' });
    } else {
      expect(saved.draftTree).toBeNull();
      expect(activate.body).toMatchObject({ code: 'CONFLICT', revision: '1' });
    }
  });

  it('rejects a lossy legacy builder restore without touching tree, blocks, or SEO', async () => {
    const admin = await adminAgent(app);
    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(200);
    const invalidSnapshots = [
      {
        seo: { seoTitleEn: 'Original' },
        blocks: [{ type: 'unknown-future-block', key: 'future' }],
      },
      { seo: { seoTitleEn: 12 }, blocks: [] },
      { seo: null, blocks: [] },
      { seo: { seoTitleEn: 'Original' }, blocks: [], unknown: true },
    ];
    const before = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    for (const [index, snapshot] of invalidSnapshots.entries()) {
      await prisma.pageVersion.create({ data: { pageId, version: index + 1, snapshot } });
      const error = await admin
        .post(`/api/admin/pages/ideas/versions/${index + 1}/builder/restore`)
        .send({ expectedRevision: '1' })
        .expect(400);
      expect(error.body).toMatchObject({
        code: 'INVALID_BLOCKS',
        fieldErrors: { snapshot: expect.any(Array) },
      });
    }
    const after = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(after.draftTree).toEqual(before.draftTree);
    expect(after.draftTreeRevision).toBe(before.draftTreeRevision);
    expect(after.seoTitleEn).toBe(before.seoTitleEn);
    expect(await prisma.pageBlock.count({ where: { pageId } })).toBe(0);
  });

  it('fails closed on unversioned preview while a tree draft is active', async () => {
    const admin = await adminAgent(app);
    await admin
      .post('/api/admin/pages/ideas/builder/activate')
      .send({ expectedRevision: '0', tree: emptyTree })
      .expect(200);
    const response = await admin.get('/api/admin/preview/pages/ideas?locale=en').expect(409);
    expect(response.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '1' });
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
      .send({ expectedRevision: '1', tree: emptyTree })
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
    expect(blocked.body).toMatchObject({ code: 'CONFLICT', mode: 'tree', revision: '2' });
    const stale = await admin
      .post('/api/admin/pages/ideas/versions/2/builder/restore')
      .send({ expectedRevision: '1' })
      .expect(409);
    expect(stale.body.code).toBe('CONFLICT');
    await admin
      .post('/api/admin/pages/ideas/versions/2/builder/restore')
      .send({ expectedRevision: '2' })
      .expect(200);
    const restored = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(restored.draftTree).toEqual(emptyTree);
    expect(restored.draftTreeRevision).toBe(3n);
    expect(restored.publishedVersionId).toBe(before.publishedVersionId);
    expect(await prisma.pageBlock.count({ where: { pageId } })).toBe(1);
    expect(
      (await admin.get('/api/admin/pages/ideas/versions/2').expect(200)).body.snapshot.tree,
    ).toEqual(emptyTree);
    const legacyRestore = await admin
      .post('/api/admin/pages/ideas/versions/1/builder/restore')
      .send({ expectedRevision: '3' })
      .expect(200);
    expect(legacyRestore.body).toEqual({ mode: 'legacy', revision: '4', tree: null });
    const legacyRow = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    expect(legacyRow.draftTree).toBeNull();
    expect(legacyRow.draftTreeRevision).toBe(4n);
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
    for (const { version, snapshot } of [
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
