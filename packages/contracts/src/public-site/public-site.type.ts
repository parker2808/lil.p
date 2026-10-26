import type { z } from 'zod';

import type { publicSiteSchema } from './public-site.schema';

export type PublicSite = z.infer<typeof publicSiteSchema>;
