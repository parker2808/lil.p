import type { z } from 'zod';

import type {
  publicProjectDetailSchema,
  publicProjectExperienceSchema,
  publicProjectListItemSchema,
  publicProjectListQuerySchema,
  publicProjectMetricSchema,
} from './projects.schema';

export type PublicProjectListQuery = z.infer<typeof publicProjectListQuerySchema>;
export type PublicProjectMetric = z.infer<typeof publicProjectMetricSchema>;
export type PublicProjectExperience = z.infer<typeof publicProjectExperienceSchema>;
export type PublicProjectListItem = z.infer<typeof publicProjectListItemSchema>;
export type PublicProjectDetail = z.infer<typeof publicProjectDetailSchema>;
