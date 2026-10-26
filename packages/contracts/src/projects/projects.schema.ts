import { z } from 'zod';

import { listParamsSchema, paginatedSchema } from '../common/list-params.schema';
import { localeSchema } from '../common/locale.schema';
import { publicProjectDomainSchema } from '../domains/domains.schema';
import { publicSkillChipSchema } from '../skills/skills.schema';
import { contentStatusSchema } from './projects.enum';

const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a kebab-case slug');

export const adminProjectMetricInputSchema = z.object({
  labelEn: z.string().min(1),
  labelVi: z.string(),
  before: z.string().nullable().optional(),
  after: z.string().nullable().optional(),
  value: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

export const projectListParamsSchema = listParamsSchema([
  'sortOrder',
  '-sortOrder',
  '-id',
  'id',
]).extend({
  featured: z.enum(['1', 'true', '0', 'false']).optional(),
  domain: z.string().min(1).optional(),
  skill: z.string().min(1).optional(),
});

export const publicProjectMetricSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  before: z.string().nullable(),
  after: z.string().nullable(),
  value: z.string(),
  lang: localeSchema,
});

export const publicProjectExperienceSchema = z.object({
  id: z.number().int(),
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  lang: localeSchema,
});

export const publicProjectListItemSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  client: z.string(),
  isFeatured: z.boolean(),
  isConfidential: z.boolean(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  versionFrom: z.string().nullable(),
  versionTo: z.string().nullable(),
  domain: publicProjectDomainSchema.nullable(),
  topMetric: publicProjectMetricSchema.nullable(),
  factChips: z.array(z.string()).max(6),
  skills: z.array(publicSkillChipSchema),
  lang: localeSchema,
});

export const publicProjectListPageSchema = paginatedSchema(publicProjectListItemSchema);

export const projectReleaseStatusSchema = z.object({
  released: z.array(z.string()),
  notReleased: z.array(z.string()),
});

export const publicProjectDetailSchema = publicProjectListItemSchema.extend({
  role: z.string(),
  teamSize: z.number().int().nullable(),
  liveUrl: z.string().nullable(),
  repoUrl: z.string().nullable(),
  problem: z.string(),
  constraints: z.string(),
  approach: z.string(),
  decisions: z.string(),
  outcome: z.string(),
  lessons: z.string(),
  /** Teammate / backend work. Must not be presented as the owner's. */
  notMine: z.string().nullable(),
  releaseStatus: projectReleaseStatusSchema.nullable(),
  keyFacts: z.array(z.string()),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  metrics: z.array(publicProjectMetricSchema),
  experience: publicProjectExperienceSchema.nullable(),
});

export const adminProjectListParamsSchema = listParamsSchema([
  'sortOrder',
  '-sortOrder',
  '-updatedAt',
  'updatedAt',
  '-id',
  'id',
]).extend({
  status: contentStatusSchema.optional(),
  domain: z.string().min(1).optional(),
});

export const projectCreateSchema = z.object({
  slug: slugSchema,
  titleEn: z.string().min(1),
  titleVi: z.string(),
  taglineEn: z.string().min(1),
  taglineVi: z.string(),
  client: z.string().min(1),
  roleEn: z.string().min(1),
  roleVi: z.string(),
  teamSize: z.number().int().positive().nullable().optional(),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
  versionFrom: z.string().nullable().optional(),
  versionTo: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isConfidential: z.boolean().optional(),
  liveUrl: z.string().nullable().optional(),
  repoUrl: z.string().nullable().optional(),
  problemEn: z.string(),
  problemVi: z.string(),
  constraintsEn: z.string(),
  constraintsVi: z.string(),
  approachEn: z.string(),
  approachVi: z.string(),
  decisionsEn: z.string(),
  decisionsVi: z.string(),
  outcomeEn: z.string(),
  outcomeVi: z.string(),
  lessonsEn: z.string(),
  lessonsVi: z.string(),
  keyFactsEn: z.string(),
  keyFactsVi: z.string(),
  factChipsEn: z.string(),
  factChipsVi: z.string(),
  notMineEn: z.string().nullable().optional(),
  notMineVi: z.string().nullable().optional(),
  releaseStatus: projectReleaseStatusSchema.nullable().optional(),
  seoTitleEn: z.string().nullable().optional(),
  seoTitleVi: z.string().nullable().optional(),
  seoDescriptionEn: z.string().nullable().optional(),
  seoDescriptionVi: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  domainId: z.number().int().nullable().optional(),
  experienceId: z.number().int().nullable().optional(),
  skillIds: z.array(z.number().int()).optional(),
  metrics: z.array(adminProjectMetricInputSchema).optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  updatedAt: z.string().optional(),
});

export const adminProjectMetricSchema = adminProjectMetricInputSchema.extend({
  id: z.number().int(),
});

export const adminProjectSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  titleEn: z.string(),
  titleVi: z.string(),
  taglineEn: z.string(),
  taglineVi: z.string(),
  client: z.string(),
  roleEn: z.string(),
  roleVi: z.string(),
  teamSize: z.number().int().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  versionFrom: z.string().nullable(),
  versionTo: z.string().nullable(),
  isFeatured: z.boolean(),
  isConfidential: z.boolean(),
  liveUrl: z.string().nullable(),
  repoUrl: z.string().nullable(),
  problemEn: z.string(),
  problemVi: z.string(),
  constraintsEn: z.string(),
  constraintsVi: z.string(),
  approachEn: z.string(),
  approachVi: z.string(),
  decisionsEn: z.string(),
  decisionsVi: z.string(),
  outcomeEn: z.string(),
  outcomeVi: z.string(),
  lessonsEn: z.string(),
  lessonsVi: z.string(),
  keyFactsEn: z.string(),
  keyFactsVi: z.string(),
  factChipsEn: z.string(),
  factChipsVi: z.string(),
  notMineEn: z.string().nullable(),
  notMineVi: z.string().nullable(),
  releaseStatus: projectReleaseStatusSchema.nullable(),
  seoTitleEn: z.string().nullable(),
  seoTitleVi: z.string().nullable(),
  seoDescriptionEn: z.string().nullable(),
  seoDescriptionVi: z.string().nullable(),
  status: contentStatusSchema,
  publishedAt: z.string().nullable(),
  sortOrder: z.number().int(),
  domainId: z.number().int().nullable(),
  experienceId: z.number().int().nullable(),
  skillIds: z.array(z.number().int()),
  metrics: z.array(adminProjectMetricSchema),
  updatedAt: z.string(),
});

export const adminProjectListItemSchema = adminProjectSchema.pick({
  id: true,
  slug: true,
  titleEn: true,
  titleVi: true,
  status: true,
  isFeatured: true,
  domainId: true,
  updatedAt: true,
});

export const adminProjectListPageSchema = paginatedSchema(adminProjectListItemSchema);
