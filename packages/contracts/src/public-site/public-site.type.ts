import type { z } from 'zod';

import type {
  publicSitemapEntrySchema,
  publicSitemapSchema,
  publicSiteSchema,
} from './public-site.schema';

export type PublicSite = z.infer<typeof publicSiteSchema>;
export type PublicSitemapEntry = z.infer<typeof publicSitemapEntrySchema>;
export type PublicSitemap = z.infer<typeof publicSitemapSchema>;
