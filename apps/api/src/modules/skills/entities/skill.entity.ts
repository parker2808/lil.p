import type { Prisma } from '../../../generated/prisma/client';

export const skillSelect = {
  id: true,
  name: true,
  slug: true,
  categoryId: true,
  depth: true,
  showInMarquee: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      nameEn: true,
      nameVi: true,
    },
  },
} satisfies Prisma.SkillSelect;

export const skillCategorySelect = {
  id: true,
  nameEn: true,
  nameVi: true,
  sortOrder: true,
  updatedAt: true,
  _count: { select: { skills: true } },
} satisfies Prisma.SkillCategorySelect;

export type SkillCategoryRow = Prisma.SkillCategoryGetPayload<{
  select: typeof skillCategorySelect;
}>;

export type SkillRow = Prisma.SkillGetPayload<{ select: typeof skillSelect }>;
