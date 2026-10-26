import type { z } from 'zod';

import type {
  adminPostInputSchema,
  publicPostDetailSchema,
  publicPostListItemSchema,
  publicPostListQuerySchema,
  publicPostTagSchema,
} from './posts.schema';

export type AdminPostInput = z.infer<typeof adminPostInputSchema>;
export type PublicPostListQuery = z.infer<typeof publicPostListQuerySchema>;
export type PublicPostTag = z.infer<typeof publicPostTagSchema>;
export type PublicPostListItem = z.infer<typeof publicPostListItemSchema>;
export type PublicPostDetail = z.infer<typeof publicPostDetailSchema>;
