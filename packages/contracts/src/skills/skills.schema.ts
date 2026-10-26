import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { skillDepthSchema } from './skills.enum';

export const publicSkillsQuerySchema = z.object({
  marquee: z.enum(['1', 'true', '0', 'false']).optional(),
});

export const publicSkillCategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  lang: localeSchema,
});

export const publicSkillSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  depth: skillDepthSchema,
  showInMarquee: z.boolean(),
  category: publicSkillCategorySchema,
  lang: localeSchema,
});

export const publicSkillChipSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const publicSkillsGroupedSchema = z.object({
  daily: z.array(publicSkillSchema),
  shipped: z.array(publicSkillSchema),
  growing: z.array(publicSkillSchema),
});

export const skillCategoryCreateSchema = z.object({
  nameEn: z.string().min(1),
  nameVi: z.string(),
  sortOrder: z.number().int().optional(),
});

export const skillCategoryUpdateSchema = skillCategoryCreateSchema.partial();

export const adminSkillCategorySchema = z.object({
  id: z.number().int(),
  nameEn: z.string(),
  nameVi: z.string(),
  sortOrder: z.number().int(),
  skillCount: z.number().int(),
  updatedAt: z.string(),
});

export const skillCreateSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  categoryId: z.number().int(),
  depth: skillDepthSchema,
  showInMarquee: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const skillUpdateSchema = skillCreateSchema.partial();

export const adminSkillSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  categoryId: z.number().int(),
  depth: skillDepthSchema,
  showInMarquee: z.boolean(),
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
