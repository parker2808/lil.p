import { z } from 'zod';

export const hueSchema = z.enum(['JADE', 'AMBER', 'BLUE', 'VIOLET', 'ROSE']);

export type Hue = z.infer<typeof hueSchema>;
