import type { z } from 'zod';

import type { publicEducationSchema } from './education.schema';

export type PublicEducation = z.infer<typeof publicEducationSchema>;
