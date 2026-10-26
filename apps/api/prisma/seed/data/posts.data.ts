import { adminPostInputSchema, publishLint } from '@portfolio/contracts';

import { readingMinutes } from '../../../src/common/utils/reading-time.util';
import type { PrismaClient } from '../../../src/generated/prisma/client';

const tags = [
  { slug: 'react', nameEn: 'React', nameVi: 'React' },
  { slug: 'vue', nameEn: 'Vue', nameVi: 'Vue' },
  { slug: 'migration', nameEn: 'Migration', nameVi: 'Migration' },
];

const BODY = `A short note on what transfers.

\`\`\`ts
const same = 'contracts first';
\`\`\`

> Note: keep the public DTO flat.

The rest is the weekly ship.`;

const posts = [
  {
    slug: 'vue-to-react',
    titleEn: 'Vue to React: what transfers',
    titleVi: '',
    excerptEn: 'What you keep when the component tree changes.',
    excerptVi: '',
    bodyEn: BODY,
    bodyVi: '',
    takeawaysEn: 'Contracts stay\nState is not the tree\nTests outlive the framework',
    takeawaysVi: '',
    isFeatured: true,
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-10-12'),
    tagSlugs: ['react', 'vue'],
  },
  {
    slug: 'strangler-routes',
    titleEn: 'Strangler routes in practice',
    titleVi: 'Route strangler trên thực tế',
    excerptEn: 'New shell, old pages, one route at a time.',
    excerptVi: 'Vỏ mới, trang cũ, từng route một.',
    bodyEn: BODY,
    bodyVi: `${BODY}\n\nBản tiếng Việt của cùng một ghi chú.`,
    takeawaysEn: 'One route\nKeep the contract\nCut over last',
    takeawaysVi: 'Một route\nGiữ hợp đồng\nCắt sang sau cùng',
    isFeatured: false,
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-09-01T00:00:00.000Z'),
    tagSlugs: ['migration'],
  },
  {
    slug: 'readable-release-notes',
    titleEn: 'Readable release notes',
    titleVi: 'Release notes dễ đọc',
    excerptEn: 'A case study should read like a changelog.',
    excerptVi: 'Một case study nên đọc như changelog.',
    bodyEn: BODY,
    bodyVi: `${BODY}\n\nPhiên bản tiếng Việt.`,
    takeawaysEn: 'Version tags\nBefore and after\nMono metadata',
    takeawaysVi: 'Thẻ phiên bản\nTrước và sau\nMetadata mono',
    isFeatured: false,
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-09-01T00:00:00.000Z'),
    tagSlugs: ['vue'],
  },
  {
    slug: 'draft-note',
    titleEn: 'Draft note',
    titleVi: 'Ghi chú nháp',
    excerptEn: 'This row must stay off the public list.',
    excerptVi: 'Dòng này phải ở ngoài danh sách công khai.',
    bodyEn: BODY,
    bodyVi: BODY,
    takeawaysEn: 'Hidden until published',
    takeawaysVi: 'Ẩn đến khi publish',
    isFeatured: false,
    status: 'DRAFT' as const,
    publishedAt: null,
    tagSlugs: ['react'],
  },
];

export async function seedPosts(prisma: PrismaClient, includePosts: boolean): Promise<void> {
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();

  const tagRows = await Promise.all(tags.map((tag) => prisma.tag.create({ data: tag })));
  const tagId = new Map(tagRows.map((row) => [row.slug, row.id]));

  if (!includePosts) {
    return;
  }

  for (const [index, post] of posts.entries()) {
    const parsed = adminPostInputSchema.safeParse(post);
    if (!parsed.success) {
      throw new Error(`Invalid post ${post.slug}: ${parsed.error.message}`);
    }
    const lint = publishLint({
      titleEn: post.titleEn,
      excerptEn: post.excerptEn,
      bodyEn: post.bodyEn,
    });
    if (!lint.ok) {
      throw new Error(`Publish lint failed for ${post.slug}: ${JSON.stringify(lint.fieldErrors)}`);
    }

    await prisma.post.create({
      data: {
        slug: post.slug,
        titleEn: post.titleEn,
        titleVi: post.titleVi,
        excerptEn: post.excerptEn,
        excerptVi: post.excerptVi,
        bodyEn: post.bodyEn,
        bodyVi: post.bodyVi,
        takeawaysEn: post.takeawaysEn,
        takeawaysVi: post.takeawaysVi,
        readingMinutes: readingMinutes(post.bodyEn),
        isFeatured: post.isFeatured,
        status: post.status,
        publishedAt: post.publishedAt,
        sortOrder: index,
        tags: { connect: post.tagSlugs.map((slug) => ({ id: tagId.get(slug)! })) },
      },
    });
  }
}
