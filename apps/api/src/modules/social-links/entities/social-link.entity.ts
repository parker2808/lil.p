import type { Prisma } from '../../../generated/prisma/client';

export const socialLinkSelect = {
  id: true,
  kind: true,
  labelEn: true,
  labelVi: true,
  url: true,
  showInHeader: true,
  showInCta: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
} satisfies Prisma.SocialLinkSelect;

export type SocialLinkRow = Prisma.SocialLinkGetPayload<{ select: typeof socialLinkSelect }>;
