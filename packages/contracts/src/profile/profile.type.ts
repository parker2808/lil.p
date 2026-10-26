import type { z } from 'zod';

import type {
  adminProfileSchema,
  profileUpdateSchema,
  publicProfileSchema,
} from './profile.schema';

export type PublicProfile = z.infer<typeof publicProfileSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AdminProfile = z.infer<typeof adminProfileSchema>;
