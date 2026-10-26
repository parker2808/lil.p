import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';

export const publicEducationSchema = z.object({
  id: z.number().int(),
  school: z.string(),
  degree: z.string(),
  major: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  lang: localeSchema,
});
