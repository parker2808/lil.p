import type { Prisma } from '../../../generated/prisma/client';

export const postTagSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameVi: true,
} satisfies Prisma.TagSelect;

export const postSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleVi: true,
  excerptEn: true,
  excerptVi: true,
  bodyEn: true,
  bodyVi: true,
  takeawaysEn: true,
  takeawaysVi: true,
  seoTitleEn: true,
  seoTitleVi: true,
  seoDescriptionEn: true,
  seoDescriptionVi: true,
  readingMinutes: true,
  isFeatured: true,
  status: true,
  publishedAt: true,
  sortOrder: true,
  coverId: true,
  updatedAt: true,
  cover: true,
  tags: { select: postTagSelect, orderBy: { slug: 'asc' as const } },
} satisfies Prisma.PostSelect;

export type PostRow = Prisma.PostGetPayload<{ select: typeof postSelect }>;
