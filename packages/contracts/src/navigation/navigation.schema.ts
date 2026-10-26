import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { navLocationSchema } from './navigation.enum';

export const publicNavItemSchema = z.object({
  id: z.number().int(),
  location: navLocationSchema,
  label: z.string(),
  href: z.string(),
  lang: localeSchema,
});
