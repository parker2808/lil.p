import type { Prisma } from '../../../generated/prisma/client';

export const pageWithBlocksInclude = {
  blocks: {
    where: { isVisible: true },
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.PageInclude;

export const pageWithAllBlocksInclude = {
  blocks: {
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.PageInclude;

export type PageWithBlocks = Prisma.PageGetPayload<{ include: typeof pageWithBlocksInclude }>;
export type PageWithAllBlocks = Prisma.PageGetPayload<{ include: typeof pageWithAllBlocksInclude }>;
