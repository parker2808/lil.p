import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { availabilitySchema } from './site-settings.enum';

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
  lang: localeSchema,
});
