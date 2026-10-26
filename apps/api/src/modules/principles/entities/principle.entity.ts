import type { Prisma } from '../../../generated/prisma/client';

export const principleSelect = {
  id: true,
  titleEn: true,
  titleVi: true,
  bodyEn: true,
  bodyVi: true,
  iconKey: true,
  sortOrder: true,
  isVisible: true,
} satisfies Prisma.PrincipleSelect;

export type PrincipleRow = Prisma.PrincipleGetPayload<{ select: typeof principleSelect }>;
