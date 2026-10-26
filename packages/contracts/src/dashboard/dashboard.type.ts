import type { z } from 'zod';

import type {
  adminHealthIssueSchema,
  adminHealthSchema,
  adminHealthSummarySchema,
  adminStatsSchema,
  contentStatusCountsSchema,
  healthIssueEntitySchema,
  healthIssueKindSchema,
  messageStatsSchema,
  statsQuerySchema,
  statsRangeSchema,
} from './dashboard.schema';

export type StatsRange = z.infer<typeof statsRangeSchema>;
export type StatsQuery = z.infer<typeof statsQuerySchema>;
export type ContentStatusCounts = z.infer<typeof contentStatusCountsSchema>;
export type MessageStats = z.infer<typeof messageStatsSchema>;
export type AdminStats = z.infer<typeof adminStatsSchema>;
export type HealthIssueKind = z.infer<typeof healthIssueKindSchema>;
export type HealthIssueEntity = z.infer<typeof healthIssueEntitySchema>;
export type AdminHealthIssue = z.infer<typeof adminHealthIssueSchema>;
export type AdminHealthSummary = z.infer<typeof adminHealthSummarySchema>;
export type AdminHealth = z.infer<typeof adminHealthSchema>;
