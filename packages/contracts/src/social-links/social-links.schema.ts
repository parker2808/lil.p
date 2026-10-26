import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { socialKindSchema } from './social-links.enum';

export const publicSocialLinkSchema = z.object({
  id: z.number().int(),
  kind: socialKindSchema,
  label: z.string(),
  url: z.string(),
  showInHeader: z.boolean(),
  showInCta: z.boolean(),
  lang: localeSchema,
});

export const socialLinkCreateSchema = z.object({
  kind: socialKindSchema,
  labelEn: z.string().min(1),
  labelVi: z.string(),
  url: z.string().min(1),
  showInHeader: z.boolean().optional(),
  showInCta: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const socialLinkUpdateSchema = socialLinkCreateSchema.partial();

export const adminSocialLinkSchema = z.object({
  id: z.number().int(),
  kind: socialKindSchema,
  labelEn: z.string(),
  labelVi: z.string(),
  url: z.string(),
  showInHeader: z.boolean(),
  showInCta: z.boolean(),
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
