import type { z } from 'zod';

import type {
  adminViewsSchema,
  topPageSchema,
  topReferrerSchema,
  trackViewSchema,
  viewDeviceSchema,
  viewsByDaySchema,
} from './analytics.schema';

export type TrackViewInput = z.infer<typeof trackViewSchema>;
export type ViewDevice = z.infer<typeof viewDeviceSchema>;
export type ViewsByDay = z.infer<typeof viewsByDaySchema>;
export type TopPage = z.infer<typeof topPageSchema>;
export type TopReferrer = z.infer<typeof topReferrerSchema>;
export type AdminViews = z.infer<typeof adminViewsSchema>;
