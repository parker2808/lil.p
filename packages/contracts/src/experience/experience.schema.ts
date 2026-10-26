import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { employmentTypeSchema } from './experience.enum';

export const publicExperienceSchema = z.object({
  id: z.number().int(),
  company: z.string(),
  companyUrl: z.string().nullable(),
  location: z.string(),
  employmentType: employmentTypeSchema,
  role: z.string(),
  summary: z.string(),
  highlights: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  lang: localeSchema,
});
