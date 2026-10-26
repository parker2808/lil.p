import type { z } from 'zod';

import type { publicProfileStatSchema } from './profile-stats.schema';

export type PublicProfileStat = z.infer<typeof publicProfileStatSchema>;
