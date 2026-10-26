import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { publicImageSchema } from '../media/media.schema';
import { availabilitySchema } from './site-settings.enum';

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
  lang: localeSchema,
});
