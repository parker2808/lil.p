import type { z } from 'zod';

import type { publicExperienceSchema } from './experience.schema';

export type PublicExperience = z.infer<typeof publicExperienceSchema>;
