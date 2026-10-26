import type { z } from 'zod';

import type {
  adminProjectListItemSchema,
  adminProjectListPageSchema,
  adminProjectListParamsSchema,
  adminProjectSchema,
  projectCreateSchema,
  projectListParamsSchema,
  projectReleaseStatusSchema,
  projectUpdateSchema,
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
export type AdminProjectListParams = z.infer<typeof adminProjectListParamsSchema>;
export type ProjectReleaseStatus = z.infer<typeof projectReleaseStatusSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type AdminProject = z.infer<typeof adminProjectSchema>;
export type AdminProjectListItem = z.infer<typeof adminProjectListItemSchema>;
export type AdminProjectListPage = z.infer<typeof adminProjectListPageSchema>;
