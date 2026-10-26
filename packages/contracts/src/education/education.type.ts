import type { z } from 'zod';

import type {
  adminEducationSchema,
  educationCreateSchema,
  educationUpdateSchema,
  publicEducationSchema,
} from './education.schema';

export type PublicEducation = z.infer<typeof publicEducationSchema>;
export type EducationCreateInput = z.infer<typeof educationCreateSchema>;
export type EducationUpdateInput = z.infer<typeof educationUpdateSchema>;
export type AdminEducation = z.infer<typeof adminEducationSchema>;
