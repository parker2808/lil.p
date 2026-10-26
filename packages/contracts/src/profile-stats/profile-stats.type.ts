import type { z } from 'zod';

import type {
  adminProfileStatSchema,
  profileStatCreateSchema,
  profileStatUpdateSchema,
  publicProfileStatSchema,
} from './profile-stats.schema';

export type PublicProfileStat = z.infer<typeof publicProfileStatSchema>;
export type ProfileStatCreateInput = z.infer<typeof profileStatCreateSchema>;
export type ProfileStatUpdateInput = z.infer<typeof profileStatUpdateSchema>;
export type AdminProfileStat = z.infer<typeof adminProfileStatSchema>;
