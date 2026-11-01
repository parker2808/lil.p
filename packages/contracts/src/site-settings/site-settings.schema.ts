import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { adminMediaSchema, publicImageSchema } from '../media/media.schema';
import { availabilitySchema } from './site-settings.enum';

export const HERO_STAT_LIMITS = { items: 3, value: 12, suffix: 4, label: 40 } as const;

export const heroStatSchema = z.object({
  value: z.string().trim().min(1).max(HERO_STAT_LIMITS.value),
  suffix: z.string().trim().max(HERO_STAT_LIMITS.suffix).optional(),
  labelEn: z.string().trim().min(1).max(HERO_STAT_LIMITS.label),
  labelVi: z.string().trim().min(1).max(HERO_STAT_LIMITS.label),
});

export const heroStatsSchema = z.array(heroStatSchema).max(HERO_STAT_LIMITS.items);

export const publicHeroStatSchema = z.object({
  value: z.string(),
  suffix: z.string().nullable(),
  label: z.string(),
});

export const siteSettingsUpdateSchema = z.object({
  siteName: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  defaultLocale: localeSchema.optional(),
  seoTitleEn: z.string().min(1).optional(),
  seoTitleVi: z.string().optional(),
  seoDescriptionEn: z.string().optional(),
  seoDescriptionVi: z.string().optional(),
  footerNoteEn: z.string().optional(),
  footerNoteVi: z.string().optional(),
  contactIntroEn: z.string().optional(),
  contactIntroVi: z.string().optional(),
  replyTimeNoteEn: z.string().optional(),
  replyTimeNoteVi: z.string().optional(),
  contactEmail: z.string().min(1).optional(),
  availability: availabilitySchema.optional(),
  availabilityNoteEn: z.string().optional(),
  availabilityNoteVi: z.string().optional(),
  analyticsEnabled: z.boolean().optional(),
  ambientEffects: z.boolean().optional(),
  marqueeEnabled: z.boolean().optional(),
  ogImageId: z.number().int().nullable().optional(),
  heroStats: heroStatsSchema.nullable().optional(),
});

export const adminSiteSettingsSchema = z.object({
  id: z.literal(1),
  siteName: z.string(),
  domain: z.string(),
  defaultLocale: localeSchema,
  seoTitleEn: z.string(),
  seoTitleVi: z.string(),
  seoDescriptionEn: z.string(),
  seoDescriptionVi: z.string(),
  footerNoteEn: z.string(),
  footerNoteVi: z.string(),
  contactIntroEn: z.string(),
  contactIntroVi: z.string(),
  replyTimeNoteEn: z.string(),
  replyTimeNoteVi: z.string(),
  contactEmail: z.string(),
  availability: availabilitySchema,
  availabilityNoteEn: z.string(),
  availabilityNoteVi: z.string(),
  analyticsEnabled: z.boolean(),
  ambientEffects: z.boolean(),
  marqueeEnabled: z.boolean(),
  ogImageId: z.number().int().nullable().optional(),
  ogImage: adminMediaSchema.nullable().optional(),
  heroStats: heroStatsSchema.nullable().optional(),
  updatedAt: z.string(),
});

export const publicSiteSettingsSchema = z.object({
  siteName: z.string(),
  domain: z.string(),
  defaultLocale: localeSchema,
  seoTitle: z.string(),
  seoDescription: z.string(),
  footerNote: z.string(),
  contactIntro: z.string(),
  replyTimeNote: z.string(),
  contactEmail: z.string(),
  availability: availabilitySchema,
  availabilityNote: z.string(),
  analyticsEnabled: z.boolean(),
  ambientEffects: z.boolean(),
  marqueeEnabled: z.boolean(),
  ogImage: publicImageSchema.nullable().optional(),
  heroStats: z.array(publicHeroStatSchema).nullable().optional(),
  lang: localeSchema,
});
