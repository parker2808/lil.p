import type { z } from 'zod';

import type {
  adminExperienceListPageSchema,
  adminExperienceListParamsSchema,
  adminExperienceSchema,
  experienceCreateSchema,
  experienceUpdateSchema,
  publicExperienceSchema,
} from './experience.schema';

export type PublicExperience = z.infer<typeof publicExperienceSchema>;
export type ExperienceCreateInput = z.infer<typeof experienceCreateSchema>;
export type ExperienceUpdateInput = z.infer<typeof experienceUpdateSchema>;
export type AdminExperience = z.infer<typeof adminExperienceSchema>;
export type AdminExperienceListParams = z.infer<typeof adminExperienceListParamsSchema>;
export type AdminExperienceListPage = z.infer<typeof adminExperienceListPageSchema>;
