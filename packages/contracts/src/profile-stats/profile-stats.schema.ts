import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { iconKeySchema } from '../constants/icons.constant';
import { statSourceSchema } from './profile-stats.enum';

export const publicProfileStatSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  value: z.string(),
  suffix: z.string().nullable(),
  source: statSourceSchema,
  iconKey: iconKeySchema,
  lang: localeSchema,
});

export const profileStatCreateSchema = z.object({
  labelEn: z.string().min(1),
  labelVi: z.string(),
  value: z.string().nullable().optional(),
  suffix: z.string().nullable().optional(),
  source: statSourceSchema,
  iconKey: iconKeySchema,
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const profileStatUpdateSchema = profileStatCreateSchema.partial();

export const adminProfileStatSchema = z.object({
  id: z.number().int(),
  labelEn: z.string(),
  labelVi: z.string(),
  value: z.string().nullable(),
  suffix: z.string().nullable(),
  source: statSourceSchema,
  iconKey: iconKeySchema,
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
