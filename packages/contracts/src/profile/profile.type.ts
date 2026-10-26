import type { z } from 'zod';

import type { publicProfileSchema } from './profile.schema';

export type PublicProfile = z.infer<typeof publicProfileSchema>;
