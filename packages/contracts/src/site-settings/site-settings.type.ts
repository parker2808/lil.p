import type { z } from 'zod';

import type { publicSiteSettingsSchema } from './site-settings.schema';

export type PublicSiteSettings = z.infer<typeof publicSiteSettingsSchema>;
