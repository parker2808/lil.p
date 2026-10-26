import { z } from 'zod';

export const STATS_RANGES = ['7d', '30d', '90d'] as const;

export const statsRangeSchema = z.enum(STATS_RANGES);

export const DEFAULT_STATS_RANGE = '30d' as const;

export const statsQuerySchema = z.object({
  range: statsRangeSchema.optional().default(DEFAULT_STATS_RANGE),
});

export function parseStatsRange(value: unknown): z.infer<typeof statsRangeSchema> {
  const parsed = statsRangeSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_STATS_RANGE;
}

export const contentStatusCountsSchema = z.object({
  draft: z.number().int().nonnegative(),
  published: z.number().int().nonnegative(),
  archived: z.number().int().nonnegative(),
  publishedInRange: z.number().int().nonnegative(),
  publishedInPrevious: z.number().int().nonnegative(),
});

export const messageStatsSchema = z.object({
  unread: z.number().int().nonnegative(),
});

export const adminStatsSchema = z.object({
  range: statsRangeSchema,
  projects: contentStatusCountsSchema,
  posts: contentStatusCountsSchema,
  messages: messageStatsSchema,
});

export const healthIssueKindSchema = z.enum([
  'PROJECT_NO_DOMAIN',
  'CASE_STUDY_KEY_FACTS',
  'MARQUEE_SKILLS',
  'MISSING_VI',
  'PUBLISH_LINT',
]);

export const healthIssueEntitySchema = z.enum(['project', 'post', 'skill']);

export const adminHealthIssueSchema = z.object({
  kind: healthIssueKindSchema,
  entity: healthIssueEntitySchema,
  id: z.number().int().nullable(),
  title: z.string(),
  href: z.string(),
  fields: z.array(z.string()).optional(),
  count: z.number().int().optional(),
});

export const adminHealthSummarySchema = z.object({
  drafts: z.number().int().nonnegative(),
  missingVi: z.number().int().nonnegative(),
  noDomain: z.number().int().nonnegative(),
  fewKeyFacts: z.number().int().nonnegative(),
  marqueeCount: z.number().int().nonnegative(),
  publishLint: z.number().int().nonnegative(),
});

export const adminHealthSchema = z.object({
  summary: adminHealthSummarySchema,
  issues: z.array(adminHealthIssueSchema),
});
