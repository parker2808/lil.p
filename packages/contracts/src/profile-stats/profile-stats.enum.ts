import { z } from 'zod';

export const statSourceSchema = z.enum(['MANUAL', 'YEARS_COMPUTED', 'PROJECT_COUNT']);

export type StatSource = z.infer<typeof statSourceSchema>;
