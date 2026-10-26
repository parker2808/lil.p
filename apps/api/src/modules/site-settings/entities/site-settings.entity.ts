import type { Prisma } from '../../../generated/prisma/client';

/** Columns we always load for SiteSettings. */
export const siteSettingsSelect = {
  id: true,
  siteName: true,
  domain: true,
  defaultLocale: true,
  seoTitleEn: true,
  seoTitleVi: true,
  seoDescriptionEn: true,
  seoDescriptionVi: true,
  footerNoteEn: true,
  footerNoteVi: true,
  contactIntroEn: true,
  contactIntroVi: true,
  replyTimeNoteEn: true,
  replyTimeNoteVi: true,
  contactEmail: true,
  availability: true,
  availabilityNoteEn: true,
  availabilityNoteVi: true,
  analyticsEnabled: true,
  ambientEffects: true,
  marqueeEnabled: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingsSelect;

export type SiteSettingsRow = Prisma.SiteSettingsGetPayload<{ select: typeof siteSettingsSelect }>;
