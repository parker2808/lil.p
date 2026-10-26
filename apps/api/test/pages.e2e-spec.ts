import type { INestApplication } from '@nestjs/common';
import { BLOCK_REGISTRY, type BlockType } from '@portfolio/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const HERO_PROPS = {
  primaryCta: { label: { en: 'View work', vi: 'Xem' }, href: '/projects' },
  showDiagram: true,
  showAvailability: true,
};

async function seedPages(prisma: PrismaService): Promise<void> {
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
  await prisma.page.create({
    data: {
      key: 'ABOUT',
      seoTitleEn: 'About',
      seoTitleVi: 'Giới thiệu',
      blocks: {
        create: {
          type: 'about-intro',
          key: 'intro',
          schemaVersion: 1,
          layout: 'SPLIT_4_8',
          surface: 'PLAIN',
          sortOrder: 0,
          isVisible: true,
          props: { eyebrow: { en: 'About', vi: '' }, showCity: true, showAvailability: true },
        },
      },
    },
  });
  await prisma.page.create({
    data: {
      key: 'PROJECTS',
      seoTitleEn: 'Work',
      seoTitleVi: 'Việc',
      blocks: {
        create: [
          {
            type: 'page-header',
            key: 'header',
            schemaVersion: 1,
            layout: 'ONE',
            surface: 'PLAIN',
            sortOrder: 0,
            isVisible: true,
            props: { eyebrow: { en: 'Work', vi: '' }, title: { en: 'Case studies', vi: '' } },
          },
          {
            type: 'projects-browser',
            key: 'projects',
            schemaVersion: 1,
            layout: 'TWO',
            surface: 'PLAIN',
            sortOrder: 1,
            isVisible: true,
            props: { showFeatured: true, pageSize: 6 },
          },
        ],
      },
    },
  });
  await prisma.page.create({ data: { key: 'NOTES', seoTitleEn: 'Notes', seoTitleVi: 'Ghi chú' } });
  await prisma.page.create({
    data: { key: 'CONTACT', seoTitleEn: 'Contact', seoTitleVi: 'Liên hệ' },
  });
}

describe('admin pages and blocks', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
    await seedPages(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists the five pages and adds every type allowed on home', async () => {
    const listed = await request(app.getHttpServer()).get('/api/admin/pages').expect(200);
    expect(listed.body.map((row: { key: string }) => row.key)).toEqual([
      'home',
      'about',
      'projects',
      'notes',
      'contact',
    ]);
    expect(listed.body[0].blockCount).toBe(1);

    const allowed = (Object.keys(BLOCK_REGISTRY) as BlockType[]).filter((type) =>
      BLOCK_REGISTRY[type].pages.includes('home'),
    );
    for (const type of allowed) {
      if (type === 'hero') {
        continue;
      }
      const created = await request(app.getHttpServer())
        .post('/api/admin/pages/home/blocks')
        .send({ type })
        .expect(201);
      expect(created.body.type).toBe(type);
      expect(created.body.key).toMatch(new RegExp(`^${type}`));
    }

    const page = await request(app.getHttpServer()).get('/api/admin/pages/home').expect(200);
    expect(page.body.blocks).toHaveLength(allowed.length);
    expect(page.body.blocks[0].type).toBe('hero');
  });

  it('returns 400 with the props path for invalid hero copy', async () => {
    const page = await request(app.getHttpServer()).get('/api/admin/pages/home').expect(200);
    const hero = page.body.blocks[0];
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/pages/home/blocks/${hero.id}`)
      .send({
        updatedAt: hero.updatedAt,
        props: {
          primaryCta: { label: { en: '' }, href: '/projects' },
          showDiagram: true,
          showAvailability: true,
        },
      })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors['props.primaryCta.label.en']).toBeDefined();
  });

  it('returns 400 BLOCK_NOT_ALLOWED for a type the page cannot host', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'about-intro' })
      .expect(400);
    expect(res.body.code).toBe('BLOCK_NOT_ALLOWED');
  });

  it('returns 409 BLOCK_LIMIT when maxPerPage is exceeded', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'hero' })
      .expect(409);
    expect(res.body.code).toBe('BLOCK_LIMIT');
  });

  it('returns 409 BLOCK_LOCKED when deleting the H1 block', async () => {
    const page = await request(app.getHttpServer()).get('/api/admin/pages/home').expect(200);
    const res = await request(app.getHttpServer())
      .delete(`/api/admin/pages/home/blocks/${page.body.blocks[0].id}`)
      .expect(409);
    expect(res.body.code).toBe('BLOCK_LOCKED');
  });

  it('returns 409 BLOCK_REQUIRED when hiding a required block', async () => {
    const page = await request(app.getHttpServer()).get('/api/admin/pages/projects').expect(200);
    const browser = page.body.blocks.find(
      (block: { type: string }) => block.type === 'projects-browser',
    );
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/pages/projects/blocks/${browser.id}`)
      .send({ isVisible: false, updatedAt: browser.updatedAt })
      .expect(409);
    expect(res.body.code).toBe('BLOCK_REQUIRED');
  });

  it('returns 409 STALE when the block updatedAt does not match', async () => {
    const page = await request(app.getHttpServer()).get('/api/admin/pages/home').expect(200);
    const hero = page.body.blocks[0];
    await request(app.getHttpServer())
      .patch(`/api/admin/pages/home/blocks/${hero.id}`)
      .send({
        updatedAt: hero.updatedAt,
        props: { ...HERO_PROPS, showDiagram: false },
      })
      .expect(200);
    const stale = await request(app.getHttpServer())
      .patch(`/api/admin/pages/home/blocks/${hero.id}`)
      .send({
        updatedAt: hero.updatedAt,
        props: { ...HERO_PROPS, showDiagram: true },
      })
      .expect(409);
    expect(stale.body.code).toBe('STALE');
  });

  it('returns 400 for an unknown project id in a case-grid', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'case-grid' })
      .expect(201);
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/pages/home/blocks/${created.body.id}`)
      .send({
        updatedAt: created.body.updatedAt,
        props: { source: 'manual', projectIds: [99999], limit: 3 },
      })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors['props.projectIds.0']).toBeDefined();
  });

  it('returns 409 fieldErrors.key for a duplicate block key', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'case-grid' })
      .expect(201);
    const second = await request(app.getHttpServer())
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'case-grid' })
      .expect(201);
    expect(second.body.key).toBe('case-grid-2');
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/pages/home/blocks/${second.body.id}`)
      .send({ key: first.body.key, updatedAt: second.body.updatedAt })
      .expect(409);
    expect(res.body.fieldErrors.key).toBeDefined();
  });

  it('duplicates a block after the original and lists unknown types only on admin', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'prose' })
      .expect(201);
    const copy = await request(app.getHttpServer())
      .post(`/api/admin/pages/home/blocks/${created.body.id}/duplicate`)
      .expect(201);
    expect(copy.body.type).toBe('prose');
    expect(copy.body.key).toBe('prose-2');
    expect(copy.body.sortOrder).toBe(created.body.sortOrder + 1);

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

    const admin = await request(app.getHttpServer()).get('/api/admin/pages/home').expect(200);
    const ghost = admin.body.blocks.find((block: { key: string }) => block.key === 'ghost');
    expect(ghost.issues).toBeDefined();
    expect(ghost.issues.join(' ')).toMatch(/Unknown block type/i);

    const pub = await request(app.getHttpServer())
      .get('/api/public/pages/home?locale=en')
      .expect(200);
    expect(pub.body.blocks.every((block: { key: string }) => block.key !== 'ghost')).toBe(true);
  });

  it('patches page SEO and bumps updatedAt', async () => {
    const before = await request(app.getHttpServer()).get('/api/admin/pages/home').expect(200);
    const patched = await request(app.getHttpServer())
      .patch('/api/admin/pages/home')
      .send({ seoTitleEn: 'Renamed home', updatedAt: before.body.updatedAt })
      .expect(200);
    expect(patched.body.seoTitleEn).toBe('Renamed home');
    expect(patched.body.updatedAt).not.toBe(before.body.updatedAt);
  });
});
