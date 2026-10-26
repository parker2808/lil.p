import type { z } from 'zod';

import type {
  projectListParamsSchema,
  publicProjectDetailSchema,
  publicProjectExperienceSchema,
  publicProjectListItemSchema,
  publicProjectListPageSchema,
  publicProjectMetricSchema,
} from './projects.schema';

export type ProjectListParams = z.infer<typeof projectListParamsSchema>;
export type PublicProjectMetric = z.infer<typeof publicProjectMetricSchema>;
export type PublicProjectExperience = z.infer<typeof publicProjectExperienceSchema>;
export type PublicProjectListItem = z.infer<typeof publicProjectListItemSchema>;
export type PublicProjectListPage = z.infer<typeof publicProjectListPageSchema>;
export type PublicProjectDetail = z.infer<typeof publicProjectDetailSchema>;
