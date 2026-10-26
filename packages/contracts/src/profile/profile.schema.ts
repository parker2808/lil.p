import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';

/** Public profile. `phone` is never in this shape. */
export const publicProfileSchema = z.object({
  displayName: z.string(),
  legalName: z.string(),
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  careerStartDate: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  bio: z.string(),
  languages: z.string(),
  heroKicker: z.string().nullable(),
  headlineAccent: z.string().nullable(),
  resumeEnId: z.number().int().nullable(),
  resumeViId: z.number().int().nullable(),
  lang: localeSchema,
});
