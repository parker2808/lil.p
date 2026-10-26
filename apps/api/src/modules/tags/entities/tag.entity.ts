import type { Prisma } from '../../../generated/prisma/client';

export const tagSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameVi: true,
  _count: {
    select: {
      posts: { where: { status: 'PUBLISHED' } },
    },
  },
} satisfies Prisma.TagSelect;

export type TagRow = Prisma.TagGetPayload<{ select: typeof tagSelect }>;
