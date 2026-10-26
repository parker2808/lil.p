import { z } from 'zod';

export const navLocationSchema = z.enum(['HEADER', 'FOOTER']);

export type NavLocation = z.infer<typeof navLocationSchema>;
