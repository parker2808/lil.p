import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { publicProjectDomainSchema } from '../domains/domains.schema';
import { publicSkillChipSchema } from '../skills/skills.schema';

export const publicProjectListQuerySchema = z.object({
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
  keyFacts: z.array(z.string()),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  metrics: z.array(publicProjectMetricSchema),
  experience: publicProjectExperienceSchema.nullable(),
});
