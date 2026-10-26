import { z } from 'zod';

export const contentStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export type ContentStatus = z.infer<typeof contentStatusSchema>;
