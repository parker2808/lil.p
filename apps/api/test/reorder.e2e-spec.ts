import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { applyReorder } from '../src/common/utils/reorder.util';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

function principle(title: string, sortOrder: number) {
  return {
    titleEn: title,
    titleVi: '',
    bodyEn: `${title} body`,
    bodyVi: '',
    iconKey: 'sparkles',
    sortOrder,
  };
}

describe('transactional reorder', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('reorders principles and rejects a list missing a row', async () => {
    const created = [];
    for (const title of ['One', 'Two', 'Three']) {
      const res = await request(app.getHttpServer())
        .post('/api/admin/principles')
        .send(principle(title, created.length))
        .expect(201);
      created.push(res.body);
    }

    const reversed = [...created].reverse().map((row: { id: number }) => row.id);
    const ordered = await request(app.getHttpServer())
      .patch('/api/admin/principles/order')
      .send({ ids: reversed })
      .expect(200);
    expect(ordered.body.map((row: { id: number }) => row.id)).toEqual(reversed);

    const missing = await request(app.getHttpServer())
      .patch('/api/admin/principles/order')
      .send({ ids: reversed.slice(0, 2) })
      .expect(400);
    expect(missing.body.code).toBe('VALIDATION_FAILED');
    expect(missing.body.fieldErrors.ids).toBeDefined();
  });

  it('keeps the H1 block first when reordering page blocks', async () => {
    await prisma.page.create({
      data: {
        key: 'HOME',
        seoTitleEn: 'Home',
        seoTitleVi: '',
        blocks: {
          create: [
            {
              type: 'hero',
              key: 'hero',
              schemaVersion: 1,
              layout: 'SPLIT_7_5',
              surface: 'PLAIN',
              sortOrder: 0,
              isVisible: true,
              props: {
                primaryCta: { label: { en: 'View work', vi: '' }, href: '/projects' },
                showDiagram: true,
                showAvailability: true,
              },
            },
            {
              type: 'prose',
              key: 'prose',
              schemaVersion: 1,
              layout: 'ONE',
              surface: 'PLAIN',
              sortOrder: 1,
              isVisible: true,
              props: { body: { en: 'Draft copy.', vi: '' } },
            },
          ],
        },
      },
    });

    const page = await request(app.getHttpServer()).get('/api/admin/pages/home').expect(200);
    const [hero, prose] = page.body.blocks;

    const locked = await request(app.getHttpServer())
      .patch('/api/admin/pages/home/blocks/order')
      .send({ ids: [prose.id, hero.id] })
      .expect(409);
    expect(locked.body.code).toBe('BLOCK_LOCKED');

    const ok = await request(app.getHttpServer())
      .patch('/api/admin/pages/home/blocks/order')
      .send({ ids: [hero.id, prose.id] })
      .expect(200);
    expect(ok.body.blocks.map((block: { id: number }) => block.id)).toEqual([hero.id, prose.id]);
  });

  it('leaves sortOrder and tags unchanged when a later write throws', async () => {
    const rows = [];
    for (const [index, title] of ['A', 'B', 'C'].entries()) {
      rows.push(
        await prisma.principle.create({
          data: {
            titleEn: title,
            titleVi: '',
            bodyEn: title,
            bodyVi: '',
            iconKey: 'sparkles',
            sortOrder: index,
          },
        }),
      );
    }
    const before = await prisma.principle.findMany({ orderBy: { id: 'asc' } });
    await expect(
      prisma.$transaction(async (tx) => {
        let writes = 0;
        await applyReorder(
          {
            findMany: (args) => tx.principle.findMany(args),
            update: async (args) => {
              writes += 1;
              if (writes === 3) {
                throw new Error('forced');
              }
              return tx.principle.update(args);
            },
          },
          [rows[2].id, rows[1].id, rows[0].id],
        );
      }),
    ).rejects.toThrow('forced');
    const afterOrder = await prisma.principle.findMany({ orderBy: { id: 'asc' } });
    expect(afterOrder.map((row) => row.sortOrder)).toEqual(before.map((row) => row.sortOrder));

    const tagKeep = await prisma.tag.create({
      data: { slug: 'keep', nameEn: 'Keep', nameVi: '' },
    });
    const tagDrop = await prisma.tag.create({
      data: { slug: 'drop', nameEn: 'Drop', nameVi: '' },
    });
    const post = await prisma.post.create({
      data: {
        slug: 'tx-note',
        titleEn: 'Original',
        titleVi: '',
        excerptEn: 'Excerpt',
        excerptVi: '',
        bodyEn: 'Body',
        bodyVi: '',
        takeawaysEn: 'One',
        takeawaysVi: '',
        readingMinutes: 1,
        tags: { connect: [{ id: tagKeep.id }] },
      },
    });

    await expect(
      prisma.$transaction(async (tx) => {
        await tx.post.update({
          where: { id: post.id },
          data: { titleEn: 'Should roll back' },
        });
        await tx.post.update({
          where: { id: post.id },
          data: { tags: { set: [{ id: tagDrop.id }] } },
        });
        throw new Error('forced');
      }),
    ).rejects.toThrow('forced');

    const afterPost = await prisma.post.findUniqueOrThrow({
      where: { id: post.id },
      include: { tags: true },
    });
    expect(afterPost.titleEn).toBe('Original');
    expect(afterPost.tags.map((tag) => tag.id)).toEqual([tagKeep.id]);
  });
});
