import { z } from 'zod';

export const availabilitySchema = z.enum(['OPEN', 'NOT_LOOKING', 'FREELANCE']);

export type Availability = z.infer<typeof availabilitySchema>;
