import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';

export const publicContactTopicSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  label: z.string(),
  lang: localeSchema,
});

export const contactTopicCreateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  labelEn: z.string().min(1),
  labelVi: z.string(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const contactTopicUpdateSchema = contactTopicCreateSchema.partial();

export const adminContactTopicSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  labelEn: z.string(),
  labelVi: z.string(),
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
