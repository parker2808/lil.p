import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { PrismaClient } from '../src/generated/prisma/client';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const apiRoot = resolve(import.meta.dirname, '..');
const draftColumns =
  /^\s+draftTree\s+Json\?\s*\n\s+draftTreeRevision\s+BigInt\s+@default\(0\)\s*\n/m;
const tree = {
  schemaVersion: 1,
  root: { id: 'page-root', type: 'page', responsive: { base: {} }, sections: [] },
};
const legacySnapshot = {
  seo: {
    seoTitleEn: 'Legacy published heading',
    seoTitleVi: null,
    seoDescriptionEn: null,
    seoDescriptionVi: null,
  },
  blocks: [
    {
      type: 'page-header',
      key: 'page-header',
      schemaVersion: 1,
      props: { title: { en: 'Legacy published heading', vi: '' } },
      layout: 'ONE',
      surface: 'PLAIN',
      isVisible: true,
      sortOrder: 0,
    },
    {
      type: 'prose',
      key: 'prose',
      schemaVersion: 1,
      props: { body: { en: 'Substantive legacy content for rollback readers.', vi: '' } },
      layout: 'ONE',
      surface: 'PLAIN',
      isVisible: true,
      sortOrder: 1,
    },
  ],
};

type OldReaderResult = {
  pageFields: string[];
  publishedVersionId: number | null;
  snapshot: unknown;
  seoTitleEn: string | null;
};

describe('pre-D2 Prisma reader against the post-D2 disposable database', () => {
  let prisma: PrismaClient;
  let fixtureDir: string;
  let databaseUrl: string;

  beforeAll(async () => {
    databaseUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL ?? '';
    if (!databaseUrl) throw new Error('DATABASE_URL_TEST is required');
    migrateTestDb();
    prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
    await prisma.$connect();

    const schema = readFileSync(join(apiRoot, 'prisma/schema.prisma'), 'utf8');
    expect(schema.match(draftColumns)).toHaveLength(1);
    fixtureDir = mkdtempSync(join(apiRoot, 'node_modules/.pre-d2-reader-'));
    writeFileSync(
      join(fixtureDir, 'schema.prisma'),
      schema
        .replace(draftColumns, '\n')
        .replace('output   = "../src/generated/prisma"', 'output   = "./generated"'),
    );
    writeFileSync(
      join(fixtureDir, 'reader.ts'),
      `import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/client';
const legacySnapshot = ${JSON.stringify(legacySnapshot)};
async function main() {
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL_TEST!) });
try {
  const page = await prisma.page.findUniqueOrThrow({ where: { key: 'rollback-reader' } });
  const version = page.publishedVersionId
    ? await prisma.pageVersion.findUniqueOrThrow({ where: { id: page.publishedVersionId } })
    : null;
  if (process.argv[2] === 'legacy-write') {
    await prisma.page.update({ where: { id: page.id }, data: { seoTitleEn: 'Edited by pre-D2 reader' } });
  }
  if (process.argv[2] === 'legacy-publish-write') {
    await prisma.$transaction(async (tx) => {
      const next = await tx.pageVersion.create({
        data: { pageId: page.id, version: 2, snapshot: legacySnapshot },
      });
      await tx.page.update({ where: { id: page.id }, data: { publishedVersionId: next.id } });
    });
  }
  console.log(JSON.stringify({
    pageFields: Object.keys(page),
    publishedVersionId: page.publishedVersionId,
    snapshot: version?.snapshot ?? null,
    seoTitleEn: page.seoTitleEn,
  }));
} finally {
  await prisma.$disconnect();
}
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
`,
    );
    execFileSync(
      'pnpm',
      ['exec', 'prisma', 'generate', '--schema', join(fixtureDir, 'schema.prisma')],
      {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'pipe',
      },
    );
  }, 120_000);

  afterAll(async () => {
    await prisma?.$disconnect();
    if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    await truncateTables(prisma);
  });

  function runOldReader(action: 'read' | 'legacy-write' | 'legacy-publish-write'): OldReaderResult {
    const output = execFileSync('pnpm', ['exec', 'tsx', join(fixtureDir, 'reader.ts'), action], {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL_TEST: databaseUrl },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(output) as OldReaderResult;
  }

  it('reads and writes a legacy page with the generated pre-D2 client after the migration', async () => {
    const page = await prisma.page.create({ data: { key: 'rollback-reader', title: 'Legacy' } });
    const legacy = runOldReader('read');
    expect(legacy.pageFields).not.toContain('draftTree');
    expect(legacy.pageFields).not.toContain('draftTreeRevision');
    runOldReader('legacy-write');
    expect((await prisma.page.findUniqueOrThrow({ where: { id: page.id } })).seoTitleEn).toBe(
      'Edited by pre-D2 reader',
    );
    expect(await prisma.page.findUniqueOrThrow({ where: { id: page.id } })).toMatchObject({
      draftTree: null,
      draftTreeRevision: 0n,
    });
  });

  it('documents the forward-only policy: a pre-D2 writer can replace a tree published pointer without revision CAS', async () => {
    const page = await prisma.page.create({
      data: { key: 'rollback-reader', title: 'Tree', seoTitleEn: 'Tree EN' },
    });
    const published = await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        version: 1,
        snapshot: {
          format: 'tree',
          snapshotVersion: 1,
          seo: {
            seoTitleEn: 'Tree EN',
            seoTitleVi: 'Tree VI',
            seoDescriptionEn: null,
            seoDescriptionVi: null,
          },
          tree,
        },
      },
    });
    await prisma.page.update({
      where: { id: page.id },
      data: { draftTree: tree, draftTreeRevision: 1n, publishedVersionId: published.id },
    });
    const reader = runOldReader('read');
    expect(reader.publishedVersionId).toBe(published.id);
    expect(reader.snapshot).toMatchObject({ format: 'tree', snapshotVersion: 1, tree });
    expect(reader.pageFields).not.toContain('draftTree');
    expect(reader.pageFields).not.toContain('draftTreeRevision');

    runOldReader('legacy-write');
    const edited = await prisma.page.findUniqueOrThrow({ where: { id: page.id } });
    expect(edited.draftTree).toEqual(tree);
    expect(edited.draftTreeRevision).toBe(1n);
    expect(edited.publishedVersionId).toBe(published.id);

    runOldReader('legacy-publish-write');
    const current = await prisma.page.findUniqueOrThrow({ where: { id: page.id } });
    expect(current.draftTree).toEqual(tree);
    expect(current.draftTreeRevision).toBe(1n);
    expect(
      (await prisma.pageVersion.findUniqueOrThrow({ where: { id: published.id } })).snapshot,
    ).toMatchObject({
      format: 'tree',
      tree,
    });
    expect(
      (
        await prisma.pageVersion.findUniqueOrThrow({
          where: { pageId_version: { pageId: page.id, version: 2 } },
        })
      ).snapshot,
    ).toEqual(legacySnapshot);
    expect(current.publishedVersionId).not.toBe(published.id);
    expect(current.publishedVersionId).toBe(
      (
        await prisma.pageVersion.findUniqueOrThrow({
          where: { pageId_version: { pageId: page.id, version: 2 } },
        })
      ).id,
    );
  });
});
