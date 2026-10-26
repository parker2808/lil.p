import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers, userAgent } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const HERO_PROPS = {
  primaryCta: { label: { en: 'View work', vi: 'Xem' }, href: '/projects' },
  showDiagram: true,
  showAvailability: true,
};

async function seedHome(prisma: PrismaService): Promise<void> {
  await prisma.page.create({
    data: {
      key: 'HOME',
      seoTitleEn: 'Home',
      seoTitleVi: 'Trang chủ',
      seoDescriptionEn: 'Home desc',
      seoDescriptionVi: 'Mô tả',
      blocks: {
        create: {
          type: 'hero',
          key: 'hero',
          schemaVersion: 1,
          layout: 'SPLIT_7_5',
          surface: 'PLAIN',
          sortOrder: 0,
          isVisible: true,
          props: HERO_PROPS,
        },
      },
    },
  });
}

describe('page versions', () => {
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
    await seedHome(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('publishes a snapshot and later draft edits leave the public page unchanged', async () => {
    const admin = await adminAgent(app);
    const unpublished = await admin.get('/api/public/pages/home?locale=en').expect(200);
    expect(unpublished.body.blocks).toEqual([]);

    await admin.post('/api/admin/pages/home/publish').send({ note: 'v1' }).expect(200);

    const live = await admin.get('/api/public/pages/home?locale=en').expect(200);
    expect(live.body.blocks).toHaveLength(1);
    expect(live.body.blocks[0].type).toBe('hero');

    const page = await admin.get('/api/admin/pages/home').expect(200);
    const hero = page.body.blocks[0];
    await admin
      .patch(`/api/admin/pages/home/blocks/${hero.id}`)
      .send({
        updatedAt: hero.updatedAt,
        props: { ...HERO_PROPS, showDiagram: false },
      })
      .expect(200);

    const stillLive = await admin.get('/api/public/pages/home?locale=en').expect(200);
    expect(stillLive.body.blocks[0].props.showDiagram).toBe(true);
  });

  it('returns 400 INVALID_BLOCKS when a visible block cannot be parsed', async () => {
    const admin = await adminAgent(app);
    const home = await prisma.page.findUniqueOrThrow({ where: { key: 'HOME' } });
    await prisma.pageBlock.create({
      data: {
        pageId: home.id,
        type: 'not-a-block',
        key: 'ghost',
        layout: 'ONE',
        surface: 'PLAIN',
        schemaVersion: 1,
        props: {},
        sortOrder: 99,
        isVisible: true,
      },
    });

    const res = await admin.post('/api/admin/pages/home/publish').send({}).expect(400);
    expect(res.body.code).toBe('INVALID_BLOCKS');
    expect(res.body.fieldErrors['block:ghost']).toBeDefined();
  });

  it('restores v1 into the draft and publishing it brings the public page back', async () => {
    const admin = await adminAgent(app);
    await admin.post('/api/admin/pages/home/publish').send({ note: 'first' }).expect(200);

    const page = await admin.get('/api/admin/pages/home').expect(200);
    const hero = page.body.blocks[0];
    await admin
      .patch(`/api/admin/pages/home/blocks/${hero.id}`)
      .send({
        updatedAt: hero.updatedAt,
        props: { ...HERO_PROPS, showDiagram: false },
      })
      .expect(200);
    await admin.post('/api/admin/pages/home/publish').send({ note: 'second' }).expect(200);

    const v2 = await admin.get('/api/public/pages/home?locale=en').expect(200);
    expect(v2.body.blocks[0].props.showDiagram).toBe(false);

    await admin.post('/api/admin/pages/home/versions/1/restore').expect(200);
    const restored = await admin.get('/api/admin/pages/home').expect(200);
    expect(restored.body.blocks[0].props.showDiagram).toBe(true);

    const stillV2 = await admin.get('/api/public/pages/home?locale=en').expect(200);
    expect(stillV2.body.blocks[0].props.showDiagram).toBe(false);

    await admin.post('/api/admin/pages/home/publish').send({ note: 'back to v1' }).expect(200);
    const v3 = await admin.get('/api/public/pages/home?locale=en').expect(200);
    expect(v3.body.blocks[0].props.showDiagram).toBe(true);

    const versions = await admin.get('/api/admin/pages/home/versions').expect(200);
    expect(versions.body.map((row: { version: number }) => row.version)).toEqual([3, 2, 1]);
  });

  it('lets a user read versions and preview but refuses publish and restore', async () => {
    const admin = await adminAgent(app);
    await admin.post('/api/admin/pages/home/publish').send({}).expect(200);

    const user = await userAgent(app);
    await user.get('/api/admin/pages/home/versions').expect(200);
    await user.get('/api/admin/pages/home/versions/1').expect(200);
    const preview = await user.get('/api/admin/preview/pages/home?locale=en').expect(200);
    expect(preview.body.blocks[0].type).toBe('hero');
    expect(preview.body.invalidBlocks).toEqual([]);

    await user.post('/api/admin/pages/home/publish').send({}).expect(403);
    await user.post('/api/admin/pages/home/versions/1/restore').expect(403);
    await user.post('/api/admin/pages/home/discard').expect(403);
  });
});
