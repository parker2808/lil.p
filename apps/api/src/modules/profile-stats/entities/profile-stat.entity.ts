import type { Prisma } from '../../../generated/prisma/client';

export const profileStatSelect = {
  id: true,
  labelEn: true,
  labelVi: true,
  value: true,
  suffix: true,
  source: true,
  iconKey: true,
  sortOrder: true,
  isVisible: true,
} satisfies Prisma.ProfileStatSelect;

export type ProfileStatRow = Prisma.ProfileStatGetPayload<{ select: typeof profileStatSelect }>;
