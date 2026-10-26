import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';

export const viewDeviceSchema = z.enum(['mobile', 'tablet', 'desktop']);

export const trackViewSchema = z.object({
  path: z.string().min(1).max(200),
  locale: localeSchema,
  referrer: z.string().max(500).optional(),
});

export const viewsByDaySchema = z.object({
  date: z.string(),
  views: z.number().int().nonnegative(),
  visitors: z.number().int().nonnegative(),
});

export const topPageSchema = z.object({
  path: z.string(),
  views: z.number().int().nonnegative(),
});

export const topReferrerSchema = z.object({
  host: z.string(),
  views: z.number().int().nonnegative(),
});

export const adminViewsSchema = z.object({
  total: z.number().int().nonnegative(),
  uniqueVisitors: z.number().int().nonnegative(),
  previousTotal: z.number().int().nonnegative(),
  previousUnique: z.number().int().nonnegative(),
  byDay: z.array(viewsByDaySchema),
  topPages: z.array(topPageSchema),
  topReferrers: z.array(topReferrerSchema),
});
