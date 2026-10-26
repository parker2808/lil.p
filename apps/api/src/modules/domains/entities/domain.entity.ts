import type { Prisma } from '../../../generated/prisma/client';

export const domainSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameVi: true,
  descriptionEn: true,
  descriptionVi: true,
  hue: true,
  iconKey: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
  _count: {
    select: {
      projects: { where: { status: 'PUBLISHED' } },
    },
  },
} satisfies Prisma.DomainSelect;

export type DomainRow = Prisma.DomainGetPayload<{ select: typeof domainSelect }>;
