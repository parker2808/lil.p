import type { z } from 'zod';

import type {
  publicSkillCategorySchema,
  publicSkillChipSchema,
  publicSkillSchema,
  publicSkillsGroupedSchema,
  publicSkillsQuerySchema,
} from './skills.schema';

export type PublicSkillsQuery = z.infer<typeof publicSkillsQuerySchema>;
export type PublicSkillCategory = z.infer<typeof publicSkillCategorySchema>;
export type PublicSkill = z.infer<typeof publicSkillSchema>;
export type PublicSkillChip = z.infer<typeof publicSkillChipSchema>;
export type PublicSkillsGrouped = z.infer<typeof publicSkillsGroupedSchema>;
