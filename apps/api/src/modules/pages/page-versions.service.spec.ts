import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageVersionsService } from './page-versions.service';

const hero = {
  id: 1,
  type: 'hero',
  key: 'hero',
  layout: 'SPLIT_7_5' as const,
  surface: 'PLAIN' as const,
  schemaVersion: 1,
  props: {
    primaryCta: { label: { en: 'View work', vi: 'Xem' }, href: '/projects' },
    showDiagram: true,
    showAvailability: true,
  },
  isVisible: true,
  sortOrder: 0,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function pageRow(over: Record<string, unknown> = {}) {
  return {
    id: 10,
    key: 'HOME',
    title: 'Home',
    locale: 'en',
    seoTitleEn: 'Home',
    seoTitleVi: 'Trang chủ',
    seoDescriptionEn: 'Desc',
    seoDescriptionVi: 'Mô tả',
    publishedVersionId: null,
    publishedVersion: null,
    publishedAt: null,
    draftTree: null,
    draftTreeRevision: 0n,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    blocks: [hero],
    ...over,
  };
}

describe('PageVersionsService', () => {
  let prisma: {
    page: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    pageVersion: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    };
    pageBlock: { deleteMany: ReturnType<typeof vi.fn>; createMany: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let service: PageVersionsService;

  beforeEach(() => {
    prisma = {
      page: { findUnique: vi.fn(), update: vi.fn() },
      pageVersion: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        aggregate: vi.fn(),
      },
      pageBlock: { deleteMany: vi.fn(), createMany: vi.fn() },
      $transaction: vi.fn(async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma)),
    };
    service = new PageVersionsService(prisma as never);
  });

  it('rejects publish when a visible block is invalid', async () => {
    prisma.page.findUnique.mockResolvedValue(
      pageRow({
        blocks: [
          hero,
          {
            ...hero,
            id: 2,
            type: 'nope',
            key: 'ghost',
            sortOrder: 1,
          },
        ],
      }),
    );

    await expect(service.publish('home', {}, 1)).rejects.toMatchObject({
      response: { code: 'INVALID_BLOCKS' },
    });
    expect(prisma.pageVersion.create).not.toHaveBeenCalled();
  });

  it.each([
    ['en', 'Ideas', 'Real English copy'],
    ['vi', 'Ý tưởng', 'Nội dung tiếng Việt thật'],
  ] as const)(
    'previews empty %s starter prose and blocks publish until real copy is entered',
    async (locale, title, copy) => {
      const header = {
        ...hero,
        type: 'page-header',
        key: 'page-header',
        layout: 'ONE',
        props: { eyebrow: { en: ' ' }, title: { en: title, vi: locale === 'vi' ? title : '' } },
      };
      const prose = {
        ...hero,
        id: 2,
        type: 'prose',
        key: 'prose',
        layout: 'ONE',
        sortOrder: 1,
        props: { body: { en: ' ', vi: '' } },
      };
      const row = pageRow({
        key: 'IDEAS',
        locale,
        title,
        seoTitleEn: locale === 'en' ? title : null,
        seoTitleVi: locale === 'vi' ? title : null,
        blocks: [header, prose],
      });
      prisma.page.findUnique.mockResolvedValue(row);
      const preview = await service.getPreview('ideas', locale);
      expect(preview.invalidBlocks).toEqual([]);
      expect(preview.blocks[1]).toMatchObject({
        type: 'prose',
        lang: 'en',
        props: { body: ' ' },
      });
      await expect(service.publish('ideas', {}, 1)).rejects.toMatchObject({
        response: {
          code: 'PAGE_BODY_REQUIRED',
          fieldErrors: {
            body: ['Add substantive visible body copy in the page language'],
          },
        },
      });
      expect(prisma.pageVersion.create).not.toHaveBeenCalled();
      prose.props.body[locale] = copy;
      prisma.pageVersion.aggregate.mockResolvedValue({ _max: { version: null } });
      prisma.pageVersion.create.mockResolvedValue({ id: 41 });
      prisma.page.update.mockResolvedValue({});
      await service.publish('ideas', {}, 1);
      expect(prisma.pageVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          snapshot: expect.objectContaining({
            blocks: expect.arrayContaining([
              expect.objectContaining({
                props: {
                  body: { en: locale === 'en' ? copy : ' ', vi: locale === 'vi' ? copy : '' },
                },
              }),
            ]),
          }),
        }),
      });
    },
  );

  it.each([
    ['en', 'untouched'],
    ['en', 'hidden'],
    ['en', 'deleted'],
    ['vi', 'untouched'],
    ['vi', 'hidden'],
    ['vi', 'deleted'],
  ] as const)('rejects %s custom page with %s starter prose', async (locale, state) => {
    const title = locale === 'vi' ? 'Ý tưởng' : 'Ideas';
    const header = {
      ...hero,
      type: 'page-header',
      key: 'page-header',
      layout: 'ONE',
      props: { eyebrow: { en: ' ' }, title: { en: title, vi: locale === 'vi' ? title : '' } },
    };
    const prose = {
      ...hero,
      id: 2,
      type: 'prose',
      key: 'prose',
      layout: 'ONE',
      sortOrder: 1,
      isVisible: state !== 'hidden',
      props: {
        body: {
          en: state === 'untouched' ? ' ' : 'Substantive English body copy',
          vi: state === 'untouched' ? '' : 'Nội dung tiếng Việt đầy đủ',
        },
      },
    };
    prisma.page.findUnique.mockResolvedValue(
      pageRow({
        key: 'IDEAS',
        locale,
        title,
        seoTitleEn: locale === 'en' ? title : null,
        seoTitleVi: locale === 'vi' ? title : null,
        blocks: state === 'deleted' ? [header] : [header, prose],
      }),
    );
    await expect(service.publish('ideas', {}, 1)).rejects.toMatchObject({
      response: {
        code: 'PAGE_BODY_REQUIRED',
        fieldErrors: { body: ['Add substantive visible body copy in the page language'] },
      },
    });
    expect(prisma.pageVersion.create).not.toHaveBeenCalled();
  });

  it('rejects publish when English SEO is missing', async () => {
    prisma.page.findUnique.mockResolvedValue(pageRow({ seoTitleEn: '' }));
    await expect(service.publish('home', {}, 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('previews a Vietnamese-first page in Vietnamese and falls back to Vietnamese in English', async () => {
    prisma.page.findUnique.mockResolvedValue(
      pageRow({
        key: 'IDEAS',
        locale: 'vi',
        title: 'Ý tưởng',
        seoTitleEn: null,
        seoTitleVi: 'Ý tưởng',
        seoDescriptionEn: null,
        seoDescriptionVi: null,
        blocks: [
          {
            ...hero,
            type: 'page-header',
            key: 'page-header',
            layout: 'ONE',
            props: { eyebrow: { en: ' ' }, title: { en: 'Ý tưởng', vi: 'Ý tưởng' } },
          },
        ],
      }),
    );
    const vi = await service.getPreview('ideas', 'vi');
    const en = await service.getPreview('ideas', 'en');
    for (const page of [vi, en]) {
      expect(page.seo).toMatchObject({ title: 'Ý tưởng', lang: 'vi' });
      expect(page.blocks[0]).toMatchObject({ props: { title: 'Ý tưởng' }, lang: 'vi' });
      expect(page.invalidBlocks).toEqual([]);
    }
  });

  it('publishes a Vietnamese-first page without an English SEO title', async () => {
    prisma.page.findUnique.mockResolvedValue(
      pageRow({
        key: 'IDEAS',
        locale: 'vi',
        title: 'Ý tưởng',
        seoTitleEn: null,
        seoTitleVi: 'Ý tưởng',
        blocks: [
          {
            ...hero,
            type: 'page-header',
            key: 'page-header',
            layout: 'ONE',
            props: { eyebrow: { en: ' ' }, title: { en: 'Ý tưởng', vi: 'Ý tưởng' } },
          },
          {
            ...hero,
            id: 2,
            type: 'prose',
            key: 'prose',
            layout: 'ONE',
            sortOrder: 1,
            props: { body: { en: ' ', vi: 'Nội dung tiếng Việt đầy đủ' } },
          },
        ],
      }),
    );
    prisma.pageVersion.aggregate.mockResolvedValue({ _max: { version: null } });
    prisma.pageVersion.create.mockResolvedValue({ id: 41 });
    prisma.page.update.mockResolvedValue({});
    await service.publish('ideas', {}, 1);
    expect(prisma.pageVersion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        snapshot: expect.objectContaining({
          seo: expect.objectContaining({ seoTitleEn: null, seoTitleVi: 'Ý tưởng' }),
        }),
      }),
    });
  });

  it('rejects a Vietnamese page without its Vietnamese SEO title', async () => {
    prisma.page.findUnique.mockResolvedValue(
      pageRow({ locale: 'vi', seoTitleEn: null, seoTitleVi: null }),
    );
    await expect(service.publish('home', {}, 1)).rejects.toMatchObject({
      response: { fieldErrors: { seoTitleVi: ['Required'] } },
    });
  });

  it('rejects publish when the H1 is missing', async () => {
    prisma.page.findUnique.mockResolvedValue(pageRow({ blocks: [] }));
    await expect(service.publish('home', {}, 1)).rejects.toBeInstanceOf(ConflictException);
  });
});
