import { BLOCK_REGISTRY, parseBlock } from '@portfolio/contracts';

import type { Prisma } from '../../../src/generated/prisma/client';
import type { PrismaClient } from '../../../src/generated/prisma/client';

type Localized = { en: string; vi: string };

function t(en: string, vi: string): Localized {
  return { en, vi };
}

function heading(
  en: { eyebrow?: string; title: string; intro?: string },
  vi: { eyebrow?: string; title: string; intro?: string },
) {
  return {
    heading: {
      ...(en.eyebrow && vi.eyebrow ? { eyebrow: t(en.eyebrow, vi.eyebrow) } : {}),
      title: t(en.title, vi.title),
      ...(en.intro && vi.intro ? { intro: t(en.intro, vi.intro) } : {}),
    },
  };
}

type SeedBlock = {
  type: string;
  key: string;
  schemaVersion: number;
  layout: Prisma.PageBlockCreateInput['layout'];
  surface: Prisma.PageBlockCreateInput['surface'];
  sortOrder: number;
  isVisible: boolean;
  props: Prisma.InputJsonValue;
};

type SeedPage = {
  key: Prisma.PageCreateInput['key'];
  seoTitleEn: string;
  seoTitleVi: string;
  seoDescriptionEn: string;
  seoDescriptionVi: string;
  blocks: SeedBlock[];
};

/**
 * Default blocks per page (PLAN D18). Text is placeholder copy from the
 * mockups; `{ en, vi }` pairs stay in `props` until T10a localizes them.
 */
export const pagesData: SeedPage[] = [
  {
    key: 'HOME',
    seoTitleEn: 'Parker Vu · Senior Frontend Engineer',
    seoTitleVi: 'Parker Vu · Senior Frontend Engineer',
    seoDescriptionEn: 'Senior frontend engineer. 5 years shipping data-dense product UIs.',
    seoDescriptionVi: 'Kỹ sư frontend. 5 năm xây dựng giao diện sản phẩm nhiều dữ liệu.',
    blocks: [
      {
        type: 'hero',
        key: 'hero',
        schemaVersion: 1,
        layout: 'SPLIT_7_5',
        surface: 'PLAIN',
        sortOrder: 0,
        isVisible: true,
        props: {
          primaryCta: { label: t('View case studies', 'Xem case study'), href: '/projects' },
          secondaryCta: { label: t('Download CV', 'Tải CV'), href: '/about' },
          showDiagram: true,
          showAvailability: true,
        },
      },
      {
        type: 'stat-band',
        key: 'stats',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'BAND',
        sortOrder: 1,
        isVisible: true,
        props: {
          ...heading({ title: 'By the numbers' }, { title: 'Con số' }),
          variant: 'default',
          statIds: [],
        },
      },
      {
        type: 'tech-marquee',
        key: 'marquee',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'BAND',
        sortOrder: 2,
        isVisible: true,
        props: heading({ title: 'Stack' }, { title: 'Công nghệ' }),
      },
      {
        type: 'featured-case',
        key: 'featured',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 3,
        isVisible: true,
        props: {
          ...heading(
            { eyebrow: 'Featured', title: 'Featured case study' },
            { eyebrow: 'Nổi bật', title: 'Case study nổi bật' },
          ),
          projectId: null,
        },
      },
      {
        type: 'domain-grid',
        key: 'domains',
        schemaVersion: 1,
        layout: 'FOUR',
        surface: 'BAND',
        sortOrder: 4,
        isVisible: true,
        props: heading(
          {
            eyebrow: 'Domains',
            title: "Products I've shipped",
            intro: 'Grouped by the problem they solve, not by the stack.',
          },
          {
            eyebrow: 'Lĩnh vực',
            title: 'Sản phẩm tôi đã ship',
            intro: 'Nhóm theo bài toán, không theo stack.',
          },
        ),
      },
      {
        type: 'case-grid',
        key: 'work',
        schemaVersion: 1,
        layout: 'THREE',
        surface: 'PLAIN',
        sortOrder: 5,
        isVisible: true,
        props: {
          ...heading(
            { eyebrow: 'Selected work', title: 'Selected work' },
            { eyebrow: 'Việc đã chọn', title: 'Việc đã chọn' },
          ),
          source: 'latest',
          projectIds: [],
          limit: 3,
        },
      },
      {
        type: 'process',
        key: 'process',
        schemaVersion: 1,
        layout: 'TWO',
        surface: 'BAND',
        sortOrder: 6,
        isVisible: true,
        props: {
          ...heading(
            {
              eyebrow: 'Process',
              title: 'How I migrate a frontend',
              intro:
                'A strangler path: keep shipping while the old tree is replaced branch by branch.',
            },
            {
              eyebrow: 'Quy trình',
              title: 'Cách tôi migrate một frontend',
              intro: 'Đường strangler: tiếp tục ship trong khi cây cũ được thay từng nhánh.',
            },
          ),
          showPrinciples: true,
        },
      },
      {
        type: 'skill-groups',
        key: 'skills',
        schemaVersion: 1,
        layout: 'THREE',
        surface: 'PLAIN',
        sortOrder: 7,
        isVisible: true,
        props: heading(
          { eyebrow: 'Stack', title: 'What I work with' },
          { eyebrow: 'Stack', title: 'Công cụ tôi dùng' },
        ),
      },
      {
        type: 'post-list',
        key: 'notes',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 8,
        isVisible: true,
        props: {
          ...heading(
            { eyebrow: 'Writing', title: 'Latest notes' },
            { eyebrow: 'Viết', title: 'Ghi chú mới' },
          ),
          limit: 3,
        },
      },
      {
        type: 'cta-band',
        key: 'cta',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 9,
        isVisible: true,
        props: {
          title: t(
            'Have a product that needs to move forward?',
            'Có sản phẩm cần tiến lên phía trước?',
          ),
          intro: t(
            'Senior frontend roles or a migration done right. Hanoi, GMT+7.',
            'Vai trò senior frontend hoặc một cuộc migration làm đúng. Hà Nội, GMT+7.',
          ),
          showEmail: true,
          showSocial: true,
        },
      },
    ],
  },
  {
    key: 'ABOUT',
    seoTitleEn: 'About',
    seoTitleVi: 'Giới thiệu',
    seoDescriptionEn: 'Parker Vu — senior frontend engineer in Hanoi.',
    seoDescriptionVi: 'Parker Vu — kỹ sư frontend tại Hà Nội.',
    blocks: [
      {
        type: 'about-intro',
        key: 'intro',
        schemaVersion: 1,
        layout: 'SPLIT_4_8',
        surface: 'PLAIN',
        sortOrder: 0,
        isVisible: true,
        props: {
          eyebrow: t('About', 'Giới thiệu'),
          showCity: true,
          showAvailability: true,
        },
      },
      {
        type: 'stat-band',
        key: 'stats',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'BAND',
        sortOrder: 1,
        isVisible: true,
        props: {
          ...heading({ title: 'By the numbers' }, { title: 'Con số' }),
          variant: 'compact',
          statIds: [],
        },
      },
      {
        type: 'timeline',
        key: 'experience',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 2,
        isVisible: true,
        props: heading({ title: 'Experience' }, { title: 'Kinh nghiệm' }),
      },
      {
        type: 'principle-list',
        key: 'principles',
        schemaVersion: 1,
        layout: 'TWO',
        surface: 'PLAIN',
        sortOrder: 3,
        isVisible: true,
        props: heading({ title: 'How I work' }, { title: 'Cách tôi làm việc' }),
      },
      {
        type: 'skill-groups',
        key: 'skills',
        schemaVersion: 1,
        layout: 'THREE',
        surface: 'PLAIN',
        sortOrder: 4,
        isVisible: true,
        props: heading({ title: 'Skills' }, { title: 'Kỹ năng' }),
      },
      {
        type: 'education-list',
        key: 'education',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 5,
        isVisible: true,
        props: heading({ title: 'Education' }, { title: 'Học vấn' }),
      },
      {
        type: 'cv-download',
        key: 'cv',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 6,
        isVisible: true,
        props: heading(
          { title: 'Curriculum vitae', intro: 'One page, two locales.' },
          { title: 'Sơ yếu lý lịch', intro: 'Một trang, hai ngôn ngữ.' },
        ),
      },
    ],
  },
  {
    key: 'PROJECTS',
    seoTitleEn: 'Work',
    seoTitleVi: 'Việc đã làm',
    seoDescriptionEn: 'Selected case studies.',
    seoDescriptionVi: 'Các case study đã chọn.',
    blocks: [
      {
        type: 'page-header',
        key: 'header',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 0,
        isVisible: true,
        props: {
          eyebrow: t('Work', 'Việc đã làm'),
          title: t('Case studies', 'Case study'),
          intro: t('Migrations, platforms, and this site.', 'Migration, nền tảng, và site này.'),
        },
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
  {
    key: 'NOTES',
    seoTitleEn: 'Notes',
    seoTitleVi: 'Ghi chú',
    seoDescriptionEn: 'Writing about migrations, testing, and frontend craft.',
    seoDescriptionVi: 'Viết về migration, kiểm thử, và nghề frontend.',
    blocks: [
      {
        type: 'page-header',
        key: 'header',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 0,
        isVisible: true,
        props: {
          eyebrow: t('Notes', 'Ghi chú'),
          title: t('Notes', 'Ghi chú'),
          intro: t('Short posts about work in progress.', 'Bài ngắn về việc đang làm.'),
        },
      },
      {
        type: 'notes-browser',
        key: 'notes',
        schemaVersion: 1,
        layout: 'ONE',
        surface: 'PLAIN',
        sortOrder: 1,
        isVisible: true,
        props: { showFeatured: true, pageSize: 10 },
      },
    ],
  },
  {
    key: 'CONTACT',
    seoTitleEn: 'Contact',
    seoTitleVi: 'Liên hệ',
    seoDescriptionEn: "Let's talk about your product.",
    seoDescriptionVi: 'Nói về sản phẩm của bạn.',
    blocks: [
      {
        type: 'contact-form',
        key: 'contact',
        schemaVersion: 1,
        layout: 'TWO',
        surface: 'PLAIN',
        sortOrder: 0,
        isVisible: true,
        props: {
          eyebrow: t('Contact', 'Liên hệ'),
          title: t("Let's talk about your product.", 'Nói về sản phẩm của bạn.'),
          intro: t(
            'Senior frontend roles or a migration done right.',
            'Vai trò senior frontend hoặc một cuộc migration làm đúng.',
          ),
        },
      },
    ],
  },
];

export async function seedPages(
  prisma: PrismaClient,
  pages: SeedPage[] = pagesData,
): Promise<void> {
  for (const page of pages) {
    const { blocks, ...pageFields } = page;
    const saved = await prisma.page.upsert({
      where: { key: page.key },
      create: pageFields,
      update: pageFields,
    });

    for (const block of blocks) {
      if (block.type in BLOCK_REGISTRY) {
        const checked = parseBlock({
          id: 0,
          type: block.type,
          key: block.key,
          layout: block.layout,
          surface: block.surface,
          schemaVersion: block.schemaVersion,
          props: block.props,
        });
        if (!checked.ok) {
          throw new Error(
            `Seed block ${page.key}/${block.key} failed: ${checked.issues.join('; ')}`,
          );
        }
      }
      await prisma.pageBlock.upsert({
        where: { pageId_key: { pageId: saved.id, key: block.key } },
        create: { ...block, pageId: saved.id },
        update: { ...block, pageId: saved.id },
      });
    }
  }

  await publishSeedPages(prisma);
}

export async function publishSeedPages(prisma: PrismaClient): Promise<void> {
  const pages = await prisma.page.findMany({
    include: { blocks: { orderBy: { sortOrder: 'asc' } }, publishedVersion: true },
  });
  for (const page of pages) {
    if (page.publishedVersionId) {
      continue;
    }
    const snapshot = {
      seo: {
        seoTitleEn: page.seoTitleEn,
        seoTitleVi: page.seoTitleVi,
        seoDescriptionEn: page.seoDescriptionEn,
        seoDescriptionVi: page.seoDescriptionVi,
      },
      blocks: page.blocks.map((block) => ({
        type: block.type,
        key: block.key,
        schemaVersion: block.schemaVersion,
        props: block.props,
        layout: block.layout,
        surface: block.surface,
        isVisible: block.isVisible,
        sortOrder: block.sortOrder,
      })),
    };
    const created = await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        version: 1,
        snapshot,
        note: 'Seed v1',
      },
    });
    const now = new Date();
    await prisma.page.update({
      where: { id: page.id },
      data: { publishedVersionId: created.id, publishedAt: now, updatedAt: now },
    });
  }
}
