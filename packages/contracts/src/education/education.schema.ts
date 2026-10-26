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

export const educationCreateSchema = z.object({
  school: z.string().min(1),
  degreeEn: z.string().min(1),
  degreeVi: z.string(),
  majorEn: z.string().min(1),
  majorVi: z.string(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const educationUpdateSchema = educationCreateSchema.partial();

export const adminEducationSchema = z.object({
  id: z.number().int(),
  school: z.string(),
  degreeEn: z.string(),
  degreeVi: z.string(),
  majorEn: z.string(),
  majorVi: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
