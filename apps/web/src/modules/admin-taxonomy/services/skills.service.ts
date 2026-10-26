import {
  type AdminSkill,
  type AdminSkillCategory,
  adminSkillCategorySchema,
  adminSkillSchema,
} from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const skillsApi = createAdminEntityApi<AdminSkill>('/api/admin/skills', adminSkillSchema);

export const skillCategoriesApi = createAdminEntityApi<AdminSkillCategory>(
  '/api/admin/skill-categories',
  adminSkillCategorySchema,
);
