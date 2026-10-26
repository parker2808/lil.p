import type { Prisma } from '../../../generated/prisma/client';

export const processStepSelect = {
  id: true,
  titleEn: true,
  titleVi: true,
  captionEn: true,
  captionVi: true,
  iconKey: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
} satisfies Prisma.ProcessStepSelect;

export type ProcessStepRow = Prisma.ProcessStepGetPayload<{ select: typeof processStepSelect }>;
