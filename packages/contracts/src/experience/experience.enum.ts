import { z } from 'zod';

export const employmentTypeSchema = z.enum(['FULL_TIME', 'CONTRACT', 'FREELANCE']);

export type EmploymentType = z.infer<typeof employmentTypeSchema>;
