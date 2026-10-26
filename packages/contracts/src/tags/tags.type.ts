import type { z } from 'zod';

import type {
  adminTagSchema,
  publicTagSchema,
  tagCreateSchema,
  tagUpdateSchema,
} from './tags.schema';

export type PublicTag = z.infer<typeof publicTagSchema>;
export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
export type AdminTag = z.infer<typeof adminTagSchema>;
