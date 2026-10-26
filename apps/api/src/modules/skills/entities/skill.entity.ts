import type { Prisma } from '../../../generated/prisma/client';

export const skillSelect = {
  id: true,
  name: true,
  slug: true,
  depth: true,
  showInMarquee: true,
  sortOrder: true,
  category: {
    select: {
      id: true,
      nameEn: true,
      nameVi: true,
    },
  },
} satisfies Prisma.SkillSelect;

export type SkillRow = Prisma.SkillGetPayload<{ select: typeof skillSelect }>;
