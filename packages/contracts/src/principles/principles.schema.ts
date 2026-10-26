import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { iconKeySchema } from '../constants/icons.constant';

export const publicPrincipleSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  body: z.string(),
  iconKey: iconKeySchema,
  lang: localeSchema,
});

export const principleCreateSchema = z.object({
  titleEn: z.string().min(1),
  titleVi: z.string(),
  bodyEn: z.string().min(1),
  bodyVi: z.string(),
  iconKey: iconKeySchema,
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const principleUpdateSchema = principleCreateSchema.partial();

export const adminPrincipleSchema = z.object({
  id: z.number().int(),
  titleEn: z.string(),
  titleVi: z.string(),
  bodyEn: z.string(),
  bodyVi: z.string(),
  iconKey: iconKeySchema,
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
