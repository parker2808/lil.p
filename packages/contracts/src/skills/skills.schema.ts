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
