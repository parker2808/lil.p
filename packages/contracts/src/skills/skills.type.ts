import type { z } from 'zod';

import type {
  adminSkillCategorySchema,
  adminSkillSchema,
  publicSkillCategorySchema,
  publicSkillChipSchema,
  publicSkillSchema,
  publicSkillsGroupedSchema,
  publicSkillsQuerySchema,
  skillCategoryCreateSchema,
  skillCategoryUpdateSchema,
  skillCreateSchema,
  skillUpdateSchema,
} from './skills.schema';

export type PublicSkillsQuery = z.infer<typeof publicSkillsQuerySchema>;
export type PublicSkillCategory = z.infer<typeof publicSkillCategorySchema>;
export type PublicSkill = z.infer<typeof publicSkillSchema>;
export type PublicSkillChip = z.infer<typeof publicSkillChipSchema>;
export type PublicSkillsGrouped = z.infer<typeof publicSkillsGroupedSchema>;
export type SkillCategoryCreateInput = z.infer<typeof skillCategoryCreateSchema>;
export type SkillCategoryUpdateInput = z.infer<typeof skillCategoryUpdateSchema>;
export type AdminSkillCategory = z.infer<typeof adminSkillCategorySchema>;
export type SkillCreateInput = z.infer<typeof skillCreateSchema>;
export type SkillUpdateInput = z.infer<typeof skillUpdateSchema>;
export type AdminSkill = z.infer<typeof adminSkillSchema>;
