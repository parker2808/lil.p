import { z } from 'zod';

import { listParamsSchema, paginatedSchema } from '../common/list-params.schema';
import { localeSchema } from '../common/locale.schema';
import { employmentTypeSchema } from './experience.enum';

export const publicExperienceSchema = z.object({
  id: z.number().int(),
  company: z.string(),
  companyUrl: z.string().nullable(),
  location: z.string(),
  employmentType: employmentTypeSchema,
  role: z.string(),
  summary: z.string(),
  highlights: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  lang: localeSchema,
});

export const experienceCreateSchema = z.object({
  company: z.string().min(1),
  companyUrl: z.string().nullable().optional(),
  location: z.string().min(1),
  employmentType: employmentTypeSchema,
  roleEn: z.string().min(1),
  roleVi: z.string(),
  summaryEn: z.string(),
  summaryVi: z.string(),
  highlightsEn: z.string(),
  highlightsVi: z.string(),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
  skillIds: z.array(z.number().int()).optional(),
});

export const experienceUpdateSchema = experienceCreateSchema.partial().extend({
  updatedAt: z.string().optional(),
});

export const adminExperienceSchema = z.object({
  id: z.number().int(),
  company: z.string(),
  companyUrl: z.string().nullable(),
  location: z.string(),
  employmentType: employmentTypeSchema,
  roleEn: z.string(),
  roleVi: z.string(),
  summaryEn: z.string(),
  summaryVi: z.string(),
  highlightsEn: z.string(),
  highlightsVi: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  skillIds: z.array(z.number().int()),
  updatedAt: z.string(),
});

export const adminExperienceListParamsSchema = listParamsSchema([
  '-startDate',
  'startDate',
  'sortOrder',
  '-sortOrder',
  'company',
  '-company',
  '-updatedAt',
  'updatedAt',
]).extend({
  visible: z.enum(['1', 'true', '0', 'false']).optional(),
});

export const adminExperienceListPageSchema = paginatedSchema(adminExperienceSchema);
