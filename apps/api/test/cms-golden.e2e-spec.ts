import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { profileData, siteSettingsData } from '../prisma/seed/data/site.data';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  adminAgent,
  createTestUsers,
  TEST_ADMIN,
  TEST_ORIGIN,
  userAgent,
} from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const HERO_PROPS = {
  primaryCta: { label: { en: 'See work', vi: 'Xem việc' }, href: '/projects' },
  showDiagram: true,
  showAvailability: true,
};

function errorShape(body: unknown, statusCode: number, code: string): void {
  expect(body).toEqual(
    expect.objectContaining({
      statusCode,
      code,
      message: expect.any(String),
      requestId: expect.any(String),
    }),
  );
}

describe('CMS golden HTTP contracts', () => {
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
    await prisma.page.create({
      data: {
        key: 'HOME',
        seoTitleEn: 'Home',
        seoTitleVi: 'Trang chủ',
        blocks: {
          create: {
            key: 'hero',
            type: 'hero',
            schemaVersion: 1,
            layout: 'SPLIT_7_5',
            surface: 'PLAIN',
            isVisible: true,
            sortOrder: 0,
            props: HERO_PROPS,
          },
        },
      },
    });
    await prisma.siteSettings.create({ data: { id: 1, ...siteSettingsData } });
    await prisma.profile.create({ data: { id: 1, ...profileData } });
  });

  afterAll(async () => app?.close());

  it('freezes unauthenticated and user/admin read/write boundaries', async () => {
    const guest = request(app.getHttpServer());
    for (const path of [
      '/api/admin/pages',
      '/api/admin/pages/home',
      '/api/admin/pages/home/versions',
      '/api/admin/pages/home/versions/1',
      '/api/admin/preview/pages/home',
      '/api/admin/site',
      '/api/admin/media',
      '/api/auth/me',
    ]) {
      const denied = await guest.get(path).expect(401);
      errorShape(denied.body, 401, 'UNAUTHENTICATED');
    }

    const user = await userAgent(app);
    for (const path of [
      '/api/admin/pages',
      '/api/admin/pages/home',
      '/api/admin/pages/home/versions',
      '/api/admin/preview/pages/home?locale=vi',
      '/api/admin/site',
      '/api/admin/media',
    ]) {
      await user.get(path).expect(200);
    }
    for (const [method, path, body] of [
      [
        'post',
        '/api/admin/pages',
        { key: 'studio', title: 'Studio', locale: 'en', template: 'empty' },
      ],
      ['patch', '/api/admin/pages/home', {}],
      ['post', '/api/admin/pages/home/blocks', { type: 'prose' }],
      ['patch', '/api/admin/pages/home/blocks/order', { ids: [] }],
      ['post', '/api/admin/pages/home/publish', {}],
      ['post', '/api/admin/pages/home/discard', {}],
      ['post', '/api/admin/pages/home/versions/1/restore', {}],
      ['patch', '/api/admin/site', { siteName: 'Changed' }],
      ['post', '/api/admin/media', {}],
    ] as const) {
      const denied = await user[method](path).send(body).expect(403);
      errorShape(denied.body, 403, 'FORBIDDEN');
    }
    const me = await user.get('/api/auth/me').expect(200);
    expect(me.body).toMatchObject({ role: 'user' });
    expect(me.body).not.toHaveProperty('passwordHash');
    errorShape(
      (await user.patch('/api/auth/password').send({}).expect(400)).body,
      400,
      'VALIDATION_FAILED',
    );
    const blockId = (await user.get('/api/admin/pages/home').expect(200)).body.blocks[0].id;
    for (const [method, path] of [
      ['patch', `/api/admin/pages/home/blocks/${blockId}`],
      ['post', `/api/admin/pages/home/blocks/${blockId}/duplicate`],
      ['delete', `/api/admin/pages/home/blocks/${blockId}`],
      ['patch', '/api/admin/media/1'],
      ['delete', '/api/admin/media/1'],
    ] as const) {
      errorShape((await user[method](path).send({}).expect(403)).body, 403, 'FORBIDDEN');
    }
  });

  it('freezes block operations, version restoration and localized published snapshots', async () => {
    const admin = await adminAgent(app);
    const listed = await admin.get('/api/admin/pages').expect(200);
    expect(listed.body).toEqual([expect.objectContaining({ key: 'home', blockCount: 1 })]);
    const initial = await admin.get('/api/admin/pages/home').expect(200);
    expect(initial.body).toMatchObject({
      key: 'home',
      publishedVersion: null,
      blocks: [expect.objectContaining({ key: 'hero', type: 'hero', sortOrder: 0 })],
    });
    const hero = initial.body.blocks[0];

    const seo = await admin
      .patch('/api/admin/pages/home')
      .send({
        updatedAt: initial.body.updatedAt,
        seoDescriptionEn: 'Selected work',
        seoDescriptionVi: 'Tác phẩm được chọn',
      })
      .expect(200);
    expect(seo.body.seoDescriptionEn).toBe('Selected work');

    const limited = await admin
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'hero' })
      .expect(409);
    errorShape(limited.body, 409, 'BLOCK_LIMIT');
    const disallowed = await admin
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'about-intro' })
      .expect(400);
    errorShape(disallowed.body, 400, 'BLOCK_NOT_ALLOWED');
    errorShape(
      (await admin.delete(`/api/admin/pages/home/blocks/${hero.id}`).expect(409)).body,
      409,
      'BLOCK_LOCKED',
    );

    const added = await admin
      .post('/api/admin/pages/home/blocks')
      .send({ type: 'prose' })
      .expect(201);
    expect(added.body).toMatchObject({ type: 'prose', key: 'prose', sortOrder: 1 });
    const copy = await admin
      .post(`/api/admin/pages/home/blocks/${added.body.id}/duplicate`)
      .expect(201);
    expect(copy.body).toMatchObject({ type: 'prose', key: 'prose-2', sortOrder: 2 });
    const ordered = await admin
      .patch('/api/admin/pages/home/blocks/order')
      .send({ ids: [hero.id, copy.body.id, added.body.id] })
      .expect(200);
    expect(ordered.body.blocks.map((block: { key: string }) => block.key)).toEqual([
      'hero',
      'prose-2',
      'prose',
    ]);
    const removed = await admin.delete(`/api/admin/pages/home/blocks/${copy.body.id}`).expect(200);
    expect(removed.body.key).toBe('prose-2');

    const currentHero = (await admin.get('/api/admin/pages/home').expect(200)).body.blocks[0];

    const invalid = await admin
      .patch(`/api/admin/pages/home/blocks/${hero.id}`)
      .send({
        updatedAt: currentHero.updatedAt,
        props: { ...HERO_PROPS, primaryCta: { label: { en: '' }, href: '/projects' } },
      })
      .expect(400);
    errorShape(invalid.body, 400, 'VALIDATION_FAILED');
    expect(invalid.body.fieldErrors['props.primaryCta.label.en']).toEqual(expect.any(Array));
    const edited = await admin
      .patch(`/api/admin/pages/home/blocks/${hero.id}`)
      .send({ updatedAt: currentHero.updatedAt, props: { ...HERO_PROPS, showDiagram: false } })
      .expect(200);
    expect(edited.body.props.showDiagram).toBe(false);
    errorShape(
      (
        await admin
          .patch(`/api/admin/pages/home/blocks/${hero.id}`)
          .send({ updatedAt: '2000-01-01T00:00:00.000Z', isVisible: true })
          .expect(409)
      ).body,
      409,
      'STALE',
    );

    const draft = await admin.get('/api/admin/preview/pages/home?locale=vi').expect(200);
    expect(draft.body).toMatchObject({ key: 'home', invalidBlocks: [] });
    expect(draft.body.blocks[0].props.primaryCta.label).toBe('Xem việc');
    expect((await admin.get('/api/public/pages/home?locale=en').expect(200)).body.blocks).toEqual(
      [],
    );
    const published = await admin
      .post('/api/admin/pages/home/publish')
      .send({ note: 'first' })
      .expect(200);
    expect(published.body.publishedVersion).toBe(1);
    for (const [locale, label, title] of [
      ['en', 'See work', 'Home'],
      ['vi', 'Xem việc', 'Trang chủ'],
    ] as const) {
      const publicPage = await request(app.getHttpServer())
        .get(`/api/public/pages/home?locale=${locale}`)
        .expect(200);
      expect(publicPage.body).toMatchObject({
        key: 'home',
        seo: { title, lang: locale },
      });
      expect(publicPage.body.blocks.map((block: { type: string }) => block.type)).toEqual([
        'hero',
        'prose',
      ]);
      expect(publicPage.body.blocks[0].props.primaryCta.label).toBe(label);
    }
    const versions = await admin.get('/api/admin/pages/home/versions').expect(200);
    expect(versions.body).toEqual([
      expect.objectContaining({ version: 1, note: 'first', blockCount: 2 }),
    ]);
    const version = await admin.get('/api/admin/pages/home/versions/1').expect(200);
    expect(version.body).toMatchObject({
      version: 1,
      snapshot: { blocks: expect.any(Array), seo: expect.any(Object) },
    });
    await admin.post('/api/admin/pages/home/versions/1/restore').expect(200);
    await admin.post('/api/admin/pages/home/discard').expect(200);
    expect(
      (await admin.get('/api/public/pages/home?locale=en').expect(200)).body.blocks[0].type,
    ).toBe('hero');
  });

  it.each(['en', 'vi'] as const)(
    'freezes %s custom page validation and publication',
    async (locale) => {
      const admin = await adminAgent(app);
      const title = locale === 'en' ? 'Studio notes' : 'Ghi chú xưởng';
      const key = `studio-${locale}`;
      const created = await admin
        .post('/api/admin/pages')
        .send({ key, title, locale, template: 'starter' })
        .expect(201);
      expect(created.body).toMatchObject({
        key,
        title,
        locale,
        publishedVersion: null,
        blocks: [
          expect.objectContaining({ type: 'page-header' }),
          expect.objectContaining({ type: 'prose' }),
        ],
      });
      errorShape(
        (
          await admin
            .post('/api/admin/pages')
            .send({ key, title, locale, template: 'empty' })
            .expect(409)
        ).body,
        409,
        'PAGE_KEY_TAKEN',
      );
      errorShape(
        (await admin.post(`/api/admin/pages/${key}/publish`).send({}).expect(400)).body,
        400,
        'PAGE_BODY_REQUIRED',
      );
      const prose = created.body.blocks[1];
      await admin
        .patch(`/api/admin/pages/${key}/blocks/${prose.id}`)
        .send({
          updatedAt: prose.updatedAt,
          props: {
            body: { en: 'Substantive English studio copy', vi: 'Nội dung xưởng tiếng Việt đầy đủ' },
          },
        })
        .expect(200);
      await admin.post(`/api/admin/pages/${key}/publish`).send({}).expect(200);
      const publicPage = await request(app.getHttpServer())
        .get(`/api/public/pages/${key}?locale=${locale}`)
        .expect(200);
      expect(publicPage.body).toMatchObject({
        key,
        seo: locale === 'vi' ? { title: null, lang: 'en' } : { title, lang: locale },
        blocks: expect.any(Array),
      });
      expect(publicPage.body.blocks.map((block: { type: string }) => block.type)).toEqual([
        'page-header',
        'prose',
      ]);
      expect(
        (await admin.get(`/api/admin/preview/pages/${key}?locale=${locale}`).expect(200)).body
          .invalidBlocks,
      ).toEqual([]);
    },
  );

  it('freezes error envelopes, settings, media and auth status/shape', async () => {
    const admin = await adminAgent(app);
    for (const path of [
      '/api/public/pages/missing',
      '/api/admin/pages/missing',
      '/api/admin/pages/home/versions/1',
    ]) {
      errorShape((await admin.get(path).expect(404)).body, 404, 'NOT_FOUND');
    }
    const badLocale = await admin.get('/api/public/pages/home?locale=fr').expect(400);
    errorShape(badLocale.body, 400, 'VALIDATION_FAILED');
    expect(badLocale.body.fieldErrors.locale).toEqual(expect.any(Array));

    const settings = await admin.get('/api/admin/site').expect(200);
    expect(settings.body).toMatchObject({ siteName: expect.any(String), heroStats: null });
    const invalid = await admin
      .patch('/api/admin/site')
      .send({ heroStats: [{ value: '' }] })
      .expect(400);
    errorShape(invalid.body, 400, 'VALIDATION_FAILED');
    const heroStats = [{ value: '5', suffix: '+', labelEn: 'Years', labelVi: 'Năm' }];
    expect(
      (await admin.patch('/api/admin/site').send({ heroStats }).expect(200)).body.heroStats,
    ).toEqual(heroStats);
    for (const [locale, label] of [
      ['en', 'Years'],
      ['vi', 'Năm'],
    ] as const) {
      const site = await request(app.getHttpServer())
        .get(`/api/public/site?locale=${locale}`)
        .expect(200);
      expect(site.body).toMatchObject({
        settings: { heroStats: [{ value: '5', suffix: '+', label }] },
        nav: { header: [], footer: [] },
      });
    }

    expect((await admin.get('/api/admin/media').expect(200)).body).toMatchObject({
      items: [],
      nextCursor: null,
    });
    const missing = await admin.post('/api/admin/media').expect(400);
    errorShape(missing.body, 400, 'VALIDATION_FAILED');
    expect(missing.body.fieldErrors.file).toEqual(expect.any(Array));
    const upload = await admin
      .post('/api/admin/media')
      .attach('file', Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\n'), {
        filename: 'contract.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    expect(upload.body).toMatchObject({ mimeType: 'application/pdf', width: null, srcset: '' });
    const updated = await admin
      .patch(`/api/admin/media/${upload.body.id}`)
      .send({ altEn: 'Résumé', altVi: 'Hồ sơ' })
      .expect(200);
    expect(updated.body).toMatchObject({ altEn: 'Résumé', altVi: 'Hồ sơ' });
    expect((await admin.get('/api/admin/media').expect(200)).body.items).toHaveLength(1);
    const publicMedia = await request(app.getHttpServer())
      .get(`/api/public/media/${upload.body.fileName}`)
      .expect(302);
    expect(publicMedia.headers).toMatchObject({
      location: expect.stringContaining(upload.body.fileName),
      'x-content-type-options': 'nosniff',
    });
    await admin.delete(`/api/admin/media/${upload.body.id}`).expect(204);
    expect((await admin.get('/api/admin/media').expect(200)).body.items).toEqual([]);

    const invalidLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', TEST_ORIGIN)
      .send({ email: TEST_ADMIN.email, password: 'incorrect' })
      .expect(401);
    errorShape(invalidLogin.body, 401, 'INVALID_CREDENTIALS');
    const loggedIn = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', TEST_ORIGIN)
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password })
      .expect(200);
    expect(loggedIn.body).toMatchObject({ role: 'admin', email: TEST_ADMIN.email });
    expect(loggedIn.body).not.toHaveProperty('passwordHash');
    expect(loggedIn.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/access_token=.*HttpOnly/),
        expect.stringMatching(/refresh_token=.*HttpOnly/),
      ]),
    );
    const refresh = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Origin', TEST_ORIGIN)
      .set('Cookie', loggedIn.headers['set-cookie'])
      .expect(204);
    expect(refresh.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringMatching(/access_token=.*HttpOnly/)]),
    );
    const logout = await admin.post('/api/auth/logout').expect(204);
    expect(logout.body).toEqual({});
    errorShape((await admin.get('/api/auth/me').expect(401)).body, 401, 'UNAUTHENTICATED');
  });
});
