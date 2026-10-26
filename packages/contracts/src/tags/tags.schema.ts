import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';

export const publicTagSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  postCount: z.number().int(),
  lang: localeSchema,
});

export const tagCreateSchema = z.object({
  nameEn: z.string().min(1),
  nameVi: z.string().optional(),
});

export const tagUpdateSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameVi: z.string().optional(),
});

export const adminTagSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  nameEn: z.string(),
  nameVi: z.string(),
  updatedAt: z.string(),
});
