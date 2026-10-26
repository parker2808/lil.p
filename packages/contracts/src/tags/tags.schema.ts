import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';

export const publicTagSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  postCount: z.number().int(),
  lang: localeSchema,
});
