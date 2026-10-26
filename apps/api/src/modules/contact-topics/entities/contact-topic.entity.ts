import type { Prisma } from '../../../generated/prisma/client';

export const contactTopicSelect = {
  id: true,
  slug: true,
  labelEn: true,
  labelVi: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
} satisfies Prisma.ContactTopicSelect;

export type ContactTopicRow = Prisma.ContactTopicGetPayload<{ select: typeof contactTopicSelect }>;
