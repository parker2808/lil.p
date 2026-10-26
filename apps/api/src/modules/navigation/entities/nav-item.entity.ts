import type { Prisma } from '../../../generated/prisma/client';

export const navItemSelect = {
  id: true,
  location: true,
  labelEn: true,
  labelVi: true,
  href: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
} satisfies Prisma.NavItemSelect;

export type NavItemRow = Prisma.NavItemGetPayload<{ select: typeof navItemSelect }>;
