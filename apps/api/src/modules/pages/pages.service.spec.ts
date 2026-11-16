import { describe, expect, it, vi } from 'vitest';

import { PagesService } from './pages.service';

const heroProps = {
  primaryCta: { label: { en: 'View work', vi: 'Xem' }, href: '/projects' },
  showDiagram: true,
  showAvailability: true,
};

describe('PagesService', () => {
  it('rolls back a legacy block delete when tree activation wins the page CAS', async () => {
    const block = { id: 42, type: 'prose', key: 'prose', sortOrder: 1 };
    const page = {
      id: 1,
      key: 'IDEAS',
      draftTree: null as unknown,
      draftTreeRevision: 0n,
      blocks: [block],
    };
    let deleted = false;
    const tx = {
      page: {
        findUnique: vi.fn(async () => ({ ...page })),
        updateMany: vi.fn(async () => {
          page.draftTree = { schemaVersion: 1 };
          page.draftTreeRevision = 1n;
          return { count: 0 };
        }),
      },
      pageBlock: {
        delete: vi.fn(async () => {
          deleted = true;
        }),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (work: (db: typeof tx) => Promise<unknown>) => {
        try {
          return await work(tx);
        } catch (error) {
          deleted = false;
          throw error;
        }
      }),
    };
    const audit = { record: vi.fn() };
    const service = new PagesService(prisma as never, audit as never);

    await expect(service.deleteBlock('ideas', block.id)).rejects.toMatchObject({
      response: { code: 'CONFLICT', mode: 'tree', revision: '1' },
    });
    expect(tx.page.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ draftTreeRevision: 0n }),
      data: expect.objectContaining({ draftTreeRevision: { increment: 1 } }),
    });
    expect(deleted).toBe(false);
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('rejects duplicating a limit-one block before any write', async () => {
    const block = { id: 42, type: 'hero', key: 'hero', sortOrder: 0 };
    const tx = {
      page: { findUnique: vi.fn().mockResolvedValue({ id: 1, key: 'HOME', blocks: [block] }) },
      pageBlock: { updateMany: vi.fn(), create: vi.fn() },
    };
    const prisma = { $transaction: vi.fn((work: (db: typeof tx) => unknown) => work(tx)) };
    const service = new PagesService(prisma as never);

    await expect(service.duplicateBlock('home', block.id)).rejects.toMatchObject({
      status: 409,
      response: { code: 'BLOCK_LIMIT' },
    });
    expect(tx.pageBlock.updateMany).not.toHaveBeenCalled();
    expect(tx.pageBlock.create).not.toHaveBeenCalled();
  });

  function createHarness(existing: boolean, race = false) {
    const row = {
      id: 12,
      key: 'IDEAS',
      title: 'Ideas',
      locale: 'vi',
      seoTitleEn: null,
      seoTitleVi: 'Ideas',
      seoDescriptionEn: null,
      seoDescriptionVi: null,
      updatedAt: new Date(),
      publishedAt: null,
      publishedVersion: null,
      blocks: [],
    };
    const tx = {
      page: {
        create: vi.fn().mockImplementation(async () => {
          if (race) throw { code: 'P2002' };
          return { id: row.id };
        }),
        findUnique: vi.fn().mockResolvedValue(row),
      },
      pageBlock: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
    };
    const prisma = {
      page: { findUnique: vi.fn().mockResolvedValue(existing ? { id: 1 } : null) },
      $transaction: vi
        .fn()
        .mockImplementation((work: (db: typeof tx) => Promise<unknown>) => work(tx)),
    };
    const audit = { record: vi.fn().mockResolvedValue(undefined) };
    const publishing = { revalidate: vi.fn().mockResolvedValue(undefined) };
    return {
      service: new PagesService(prisma as never, audit as never, publishing as never),
      prisma,
      tx,
      audit,
      publishing,
    };
  }

  it('creates a draft and starter blocks with an audit record, then revalidates', async () => {
    const h = createHarness(false);
    const page = await h.service.createPage({
      title: 'Ideas',
      key: 'ideas',
      locale: 'vi',
      template: 'starter',
    });
    expect(page).toMatchObject({ key: 'ideas', title: 'Ideas', locale: 'vi', blocks: [] });
    expect(h.tx.page.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ key: 'IDEAS', locale: 'vi', seoTitleVi: 'Ideas' }),
    });
    expect(h.tx.pageBlock.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ type: 'page-header' }),
        expect.objectContaining({ type: 'prose' }),
      ]),
    });
    expect(h.audit.record).toHaveBeenCalledWith(
      h.tx,
      expect.objectContaining({ action: 'CREATE', entityType: 'page', entityId: 'ideas' }),
    );
    expect(h.publishing.revalidate).toHaveBeenCalledWith(['page:ideas']);
  });

  it.each([
    ['en', 'Ideas', 'Ideas', null],
    ['vi', 'Ý tưởng', null, 'Ý tưởng'],
  ] as const)(
    'stores a %s starter title only in its selected locale',
    async (locale, title, en, vi) => {
      const h = createHarness(false);
      await h.service.createPage({ title, key: 'ideas', locale, template: 'starter' });
      expect(h.tx.page.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ locale, seoTitleEn: en, seoTitleVi: vi }),
      });
      expect(h.tx.pageBlock.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            type: 'page-header',
            props: { eyebrow: { en: ' ', vi: '' }, title: { en: title, vi: vi ?? '' } },
          }),
          expect.objectContaining({
            type: 'prose',
            props: { body: { en: ' ', vi: '' } },
          }),
        ]),
      });
    },
  );

  it('creates an empty draft without blocks', async () => {
    const h = createHarness(false);
    await h.service.createPage({ title: 'Ideas', key: 'ideas', locale: 'vi', template: 'empty' });
    expect(h.tx.pageBlock.createMany).not.toHaveBeenCalled();
  });

  it('returns 409 for an existing key and a concurrent unique-index collision', async () => {
    const h = createHarness(true);
    await expect(
      h.service.createPage({ title: 'Ideas', key: 'ideas', locale: 'en', template: 'empty' }),
    ).rejects.toMatchObject({ status: 409 });
    expect(h.prisma.$transaction).not.toHaveBeenCalled();
    const race = createHarness(false, true);
    await expect(
      race.service.createPage({ title: 'Ideas', key: 'ideas', locale: 'en', template: 'empty' }),
    ).rejects.toMatchObject({ status: 409 });
    expect(race.audit.record).not.toHaveBeenCalled();
  });
  it.each(['home', 'about', 'projects', 'notes', 'contact', 'craft'])(
    'returns 409 before querying the database for reserved route %s',
    async (key) => {
      const h = createHarness(false);
      await expect(
        h.service.createPage({ title: 'Page', key, locale: 'en', template: 'empty' }),
      ).rejects.toMatchObject({ status: 409 });
      expect(h.prisma.page.findUnique).not.toHaveBeenCalled();
    },
  );
  it('serves the published snapshot and drops unknown snapshot blocks', async () => {
    const prisma = {
      page: {
        findUnique: vi.fn().mockResolvedValue({
          key: 'HOME',
          publishedVersion: {
            snapshot: {
              seo: {
                seoTitleEn: 'Home',
                seoTitleVi: 'Trang chủ',
                seoDescriptionEn: 'Desc',
                seoDescriptionVi: 'Mô tả',
              },
              blocks: [
                {
                  type: 'hero',
                  key: 'hero',
                  layout: 'SPLIT_7_5',
                  surface: 'PLAIN',
                  schemaVersion: 1,
                  props: heroProps,
                  isVisible: true,
                  sortOrder: 0,
                },
                {
                  type: 'nope',
                  key: 'broken',
                  layout: 'ONE',
                  surface: 'PLAIN',
                  schemaVersion: 1,
                  props: {},
                  isVisible: true,
                  sortOrder: 1,
                },
              ],
            },
          },
        }),
      },
    };

    const service = new PagesService(prisma as never);
    const page = await service.getPublic('home', 'vi', 'req-test');
    if (!('blocks' in page)) throw new Error('Expected legacy page');
    expect(page.key).toBe('home');
    expect(page.blocks).toHaveLength(1);
    expect(page.blocks[0]?.type).toBe('hero');
    expect(page.blocks[0]?.lang).toBe('vi');
  });

  it.each(['en', 'vi'] as const)(
    'serves a VI-only custom page SEO title in Vietnamese for %s requests',
    async (locale) => {
      const prisma = {
        page: {
          findUnique: vi.fn().mockResolvedValue({
            key: 'IDEAS',
            publishedVersion: {
              snapshot: {
                seo: {
                  seoTitleEn: null,
                  seoTitleVi: 'Ý tưởng',
                  seoDescriptionEn: null,
                  seoDescriptionVi: 'Mô tả',
                },
                blocks: [],
              },
            },
          }),
        },
      };
      const page = await new PagesService(prisma as never).getPublic('ideas', locale);
      expect(page.seo).toEqual({ title: 'Ý tưởng', description: 'Mô tả', lang: 'vi' });
    },
  );

  it.each([
    ['home', null, 'Trang chủ', null, 'en'],
    ['ideas', 'Ideas', 'Ý tưởng', 'Ideas', 'en'],
  ] as const)(
    'keeps existing %s SEO fallback for EN title %s',
    async (key, seoTitleEn, seoTitleVi, title, lang) => {
      const prisma = {
        page: {
          findUnique: vi.fn().mockResolvedValue({
            publishedVersion: {
              snapshot: {
                seo: {
                  seoTitleEn,
                  seoTitleVi,
                  seoDescriptionEn: 'English description',
                  seoDescriptionVi: null,
                },
                blocks: [],
              },
            },
          }),
        },
      };
      const page = await new PagesService(prisma as never).getPublic(key, 'vi');
      expect(page.seo).toEqual({ title, description: 'English description', lang });
    },
  );

  it('returns an empty shell when the page was never published', async () => {
    const prisma = {
      page: {
        findUnique: vi.fn().mockResolvedValue({
          key: 'HOME',
          publishedVersion: null,
        }),
      },
    };
    const service = new PagesService(prisma as never);
    const page = await service.getPublic('home', 'en');
    if (!('blocks' in page)) throw new Error('Expected legacy page');
    expect(page.blocks).toEqual([]);
  });

  it('returns 404 for an unpublished custom page', async () => {
    const prisma = {
      page: {
        findUnique: vi.fn().mockResolvedValue({ key: 'STUDIO-NOTES', publishedVersion: null }),
      },
    };
    await expect(
      new PagesService(prisma as never).getPublic('studio-notes', 'en'),
    ).rejects.toMatchObject({ status: 404 });
  });
});
