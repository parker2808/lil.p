import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { publicImageSchema } from '../media/media.schema';

function accentInHeadline(
  headline: string | undefined,
  accent: string | null | undefined,
  path: string,
  ctx: z.RefinementCtx,
) {
  if (!accent || headline === undefined) return;
  if (!headline.includes(accent)) {
    ctx.addIssue({
      code: 'custom',
      path: [path],
      message: 'Must appear in the headline',
    });
  }
}

export const profileUpdateSchema = z
  .object({
    displayName: z.string().min(1).optional(),
    legalName: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    timezone: z.string().min(1).optional(),
    careerStartDate: z.string().min(1).optional(),
    headlineEn: z.string().min(1).optional(),
    headlineVi: z.string().optional(),
    subheadlineEn: z.string().optional(),
    subheadlineVi: z.string().optional(),
    bioEn: z.string().optional(),
    bioVi: z.string().optional(),
    languagesEn: z.string().optional(),
    languagesVi: z.string().optional(),
    heroKickerEn: z.string().nullable().optional(),
    heroKickerVi: z.string().nullable().optional(),
    headlineAccentEn: z.string().nullable().optional(),
    headlineAccentVi: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    avatarId: z.number().int().nullable().optional(),
    resumeEnId: z.number().int().nullable().optional(),
    resumeViId: z.number().int().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    accentInHeadline(data.headlineEn, data.headlineAccentEn, 'headlineAccentEn', ctx);
    accentInHeadline(data.headlineVi, data.headlineAccentVi, 'headlineAccentVi', ctx);
  });

export const adminProfileSchema = z.object({
  id: z.literal(1),
  displayName: z.string(),
  legalName: z.string(),
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  careerStartDate: z.string(),
  headlineEn: z.string(),
  headlineVi: z.string(),
  subheadlineEn: z.string(),
  subheadlineVi: z.string(),
  bioEn: z.string(),
  bioVi: z.string(),
  languagesEn: z.string(),
  languagesVi: z.string(),
  heroKickerEn: z.string().nullable(),
  heroKickerVi: z.string().nullable(),
  headlineAccentEn: z.string().nullable(),
  headlineAccentVi: z.string().nullable(),
  avatarId: z.number().int().nullable().optional(),
  resumeEnId: z.number().int().nullable(),
  resumeViId: z.number().int().nullable(),
  phone: z.string().nullable(),
  updatedAt: z.string(),
});

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
  avatar: publicImageSchema.nullable().optional(),
  lang: localeSchema,
});
