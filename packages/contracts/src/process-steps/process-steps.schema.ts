import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { iconKeySchema } from '../constants/icons.constant';

export const publicProcessStepSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  caption: z.string(),
  iconKey: iconKeySchema,
  lang: localeSchema,
});

export const processStepCreateSchema = z.object({
  titleEn: z.string().min(1),
  titleVi: z.string(),
  captionEn: z.string().min(1),
  captionVi: z.string(),
  iconKey: iconKeySchema,
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const processStepUpdateSchema = processStepCreateSchema.partial();

export const adminProcessStepSchema = z.object({
  id: z.number().int(),
  titleEn: z.string(),
  titleVi: z.string(),
  captionEn: z.string(),
  captionVi: z.string(),
  iconKey: iconKeySchema,
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
