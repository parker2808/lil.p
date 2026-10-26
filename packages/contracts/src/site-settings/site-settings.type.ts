import type { z } from 'zod';

import type {
  adminSiteSettingsSchema,
  publicSiteSettingsSchema,
  siteSettingsUpdateSchema,
} from './site-settings.schema';

export type PublicSiteSettings = z.infer<typeof publicSiteSettingsSchema>;
export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;
export type AdminSiteSettings = z.infer<typeof adminSiteSettingsSchema>;
