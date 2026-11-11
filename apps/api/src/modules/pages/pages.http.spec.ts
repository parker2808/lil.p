import type { INestApplication } from '@nestjs/common';
import { type CanActivate, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminPagesController } from './admin-pages.controller';
import { PageVersionsService } from './page-versions.service';
import { PagesService } from './pages.service';

type MockBlock = {
  id: number;
  pageId: number;
  type: string;
  key: string;
  schemaVersion: number;
  props: {
    eyebrow?: { en: string; vi: string };
    title?: { en: string; vi: string };
    body?: { en: string; vi: string };
  };
  layout: string;
  surface: string;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: Date;
};
type MockPage = {
  id: number;
  key: string;
  title: string;
  locale: 'en' | 'vi';
  seoTitleEn: string | null;
  seoTitleVi: string | null;
  seoDescriptionEn: null;
  seoDescriptionVi: null;
  publishedVersionId: number | null;
  publishedVersion: { version: number } | null;
  publishedAt: Date | null;
  draftTree: null;
  draftTreeRevision: bigint;
  updatedAt: Date;
  blocks: MockBlock[];
};

class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: { role: string; id: number };
    }>();
    const role = req.headers['x-test-role'];
    if (!role) throw new UnauthorizedException();
    req.user = { role, id: 7 };
    return true;
  }
}

describe('real page services over Nest HTTP with transactional Prisma state', () => {
  let app: INestApplication;
  let page: MockPage | null = null;
  let versionCount = 0;
  const currentPage = (): MockPage => {
    if (!page) throw new Error('Missing created page');
    return page;
  };
  const audit = { record: vi.fn(async () => undefined) };
  const revalidate = { revalidate: vi.fn(async () => undefined) };
  const db = {
    page: {
      findUnique: vi.fn(async () => page),
      create: vi.fn(
        async ({
          data,
        }: {
          data: {
            key: string;
            title: string;
            locale: 'en' | 'vi';
            seoTitleEn: string | null;
            seoTitleVi: string | null;
          };
        }) => {
          page = {
            id: 31,
            key: data.key,
            title: data.title,
            locale: data.locale,
            seoTitleEn: data.seoTitleEn,
            seoTitleVi: data.seoTitleVi,
            seoDescriptionEn: null,
            seoDescriptionVi: null,
            publishedVersionId: null,
            publishedVersion: null,
            publishedAt: null,
            draftTree: null,
            draftTreeRevision: 0n,
            updatedAt: new Date('2026-11-03T00:00:00Z'),
            blocks: [],
          };
          return page;
        },
      ),
      update: vi.fn(async ({ data }: { data: Partial<MockPage> }) => {
        if (page) Object.assign(page, data, { publishedVersion: { version: versionCount } });
        return page;
      }),
    },
    pageBlock: {
      createMany: vi.fn(async ({ data }: { data: Array<Omit<MockBlock, 'id' | 'updatedAt'>> }) => {
        if (page)
          page.blocks = data.map((block, index) => ({
            ...block,
            id: index + 1,
            updatedAt: new Date('2026-11-03T00:00:00Z'),
          }));
        return { count: data.length };
      }),
    },
    pageVersion: {
      aggregate: vi.fn(async () => ({ _max: { version: versionCount || null } })),
      create: vi.fn(async () => ({ id: ++versionCount })),
    },
    $transaction: vi.fn(async (work: (tx: typeof db) => Promise<unknown>) => {
      const before = page ? structuredClone(page) : null;
      try {
        return await work(db);
      } catch (error) {
        page = before;
        throw error;
      }
    }),
  };

  beforeAll(async () => {
    const pages = new PagesService(db as never, audit as never, revalidate as never);
    const versions = new PageVersionsService(db as never, undefined, undefined, audit as never);
    const module = await Test.createTestingModule({
      controllers: [AdminPagesController],
      providers: [
        { provide: PagesService, useValue: pages },
        { provide: PageVersionsService, useValue: versions },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards(new TestAuthGuard(), new RolesGuard(app.get(Reflector)));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });
  afterAll(async () => app?.close());

  it.each(['en', 'vi'] as const)(
    'creates and publishes %s only after visible localized body copy',
    async (locale) => {
      page = null;
      versionCount = 0;
      audit.record.mockClear();
      revalidate.revalidate.mockClear();
      const title = locale === 'vi' ? 'Ý tưởng' : 'Ideas';
      const body = { title, key: 'ideas', locale, template: 'starter' };
      const created = await request(app.getHttpServer())
        .post('/api/admin/pages')
        .set('x-test-role', 'admin')
        .send(body)
        .expect(201);
      expect(created.body).toMatchObject({ key: 'ideas', title, locale, publishedVersion: null });
      expect(created.body.blocks).toHaveLength(2);
      expect(
        (
          await request(app.getHttpServer())
            .get('/api/admin/pages/ideas')
            .set('x-test-role', 'admin')
            .expect(200)
        ).body.blocks,
      ).toHaveLength(2);
      expect(audit.record).toHaveBeenCalledWith(db, expect.objectContaining({ action: 'CREATE' }));
      expect(revalidate.revalidate).toHaveBeenCalledWith(['page:ideas']);
      const versions = new PageVersionsService(db as never);
      expect((await versions.getPreview('ideas', locale)).invalidBlocks).toEqual([]);
      const publish = () =>
        request(app.getHttpServer())
          .post('/api/admin/pages/ideas/publish')
          .set('x-test-role', 'admin')
          .send({});
      for (const state of ['untouched', 'hidden', 'deleted'] as const) {
        const storedPage = currentPage();
        const prose = storedPage.blocks.find((block) => block.type === 'prose');
        if (!prose) throw new Error('Missing prose block');
        prose.props.body = { en: 'Substantive English copy', vi: 'Nội dung tiếng Việt đầy đủ' };
        prose.isVisible = state !== 'hidden';
        if (state === 'untouched') prose.props.body[locale] = locale === 'en' ? ' ' : '';
        if (state === 'deleted')
          storedPage.blocks = storedPage.blocks.filter((block) => block.type !== 'prose');
        const denied = await publish();
        expect(denied.status).toBe(400);
        expect(denied.body).toMatchObject({
          code: 'PAGE_BODY_REQUIRED',
          fieldErrors: { body: expect.any(Array) },
        });
        expect(versionCount).toBe(0);
        if (state === 'deleted') currentPage().blocks.push(prose);
      }
      const prose = currentPage().blocks.find((block) => block.type === 'prose');
      if (!prose) throw new Error('Missing prose block');
      prose.isVisible = true;
      prose.props.body = { en: 'Substantive English copy', vi: 'Nội dung tiếng Việt đầy đủ' };
      const published = await publish();
      expect(published.status).toBe(200);
      expect(published.body.publishedVersion).toBe(1);
      expect(audit.record).toHaveBeenCalledWith(db, expect.objectContaining({ action: 'PUBLISH' }));
    },
  );

  it.each(['en', 'vi'] as const)(
    'requires an H1 and locale body for an empty %s page',
    async (locale) => {
      page = null;
      versionCount = 0;
      const key = `empty-${locale}`;
      const created = await request(app.getHttpServer())
        .post('/api/admin/pages')
        .set('x-test-role', 'admin')
        .send({ title: 'Empty studio', key, locale, template: 'empty' })
        .expect(201);
      expect(created.body.blocks).toEqual([]);
      const publish = () =>
        request(app.getHttpServer())
          .post(`/api/admin/pages/${key}/publish`)
          .set('x-test-role', 'admin')
          .send({});
      expect((await publish()).status).toBe(409);

      const base = {
        pageId: currentPage().id,
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        isVisible: true,
        updatedAt: new Date('2026-11-03T00:00:00Z'),
      };
      currentPage().blocks = [
        {
          ...base,
          id: 1,
          type: 'page-header',
          key: 'page-header',
          sortOrder: 0,
          props: {
            eyebrow: { en: ' ', vi: '' },
            title: { en: 'Studio notes', vi: 'Ghi chú xưởng' },
          },
        },
      ];
      const noBody = await publish();
      expect(noBody.status).toBe(400);
      expect(noBody.body).toMatchObject({
        code: 'PAGE_BODY_REQUIRED',
        fieldErrors: { body: expect.any(Array) },
      });
      currentPage().blocks.push({
        ...base,
        id: 2,
        type: 'prose',
        key: 'prose',
        sortOrder: 1,
        props: {
          body: { en: 'Substantive English studio copy', vi: 'Nội dung xưởng tiếng Việt đầy đủ' },
        },
      });
      const published = await publish();
      expect(published.status).toBe(200);
      expect(published.body.publishedVersion).toBe(1);
    },
  );

  it('rejects a user, malformed input, reserved keys, duplicates and index races', async () => {
    page = null;
    const body = { title: 'Ideas', key: 'ideas', locale: 'en', template: 'empty' };
    await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'user')
      .send(body)
      .expect(403);
    const invalid = await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'admin')
      .send({ ...body, title: ' ', key: 'Bad_Key' })
      .expect(400);
    expect(invalid.body.code).toBe('VALIDATION_FAILED');
    const reserved = await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'admin')
      .send({ ...body, key: 'craft' })
      .expect(409);
    expect(reserved.body.code).toBe('PAGE_KEY_TAKEN');
    await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'admin')
      .send(body)
      .expect(201);
    const duplicate = await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'admin')
      .send(body)
      .expect(409);
    expect(duplicate.body.code).toBe('PAGE_KEY_TAKEN');
    page = null;
    db.page.create.mockRejectedValueOnce({ code: 'P2002' });
    const race = await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'admin')
      .send(body)
      .expect(409);
    expect(race.body.code).toBe('PAGE_KEY_TAKEN');
  });

  it('rolls back page and blocks if audit creation fails', async () => {
    page = null;
    revalidate.revalidate.mockClear();
    audit.record.mockRejectedValueOnce(new Error('audit unavailable'));
    await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'admin')
      .send({ title: 'Ideas', key: 'ideas', locale: 'en', template: 'starter' })
      .expect(500);
    expect(page).toBeNull();
    expect(revalidate.revalidate).not.toHaveBeenCalled();
  });
});
