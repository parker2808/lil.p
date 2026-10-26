import type { z } from 'zod';

import type {
  adminPostInputSchema,
  postListParamsSchema,
  publicPostDetailSchema,
  publicPostListItemSchema,
  publicPostListPageSchema,
  publicPostTagSchema,
} from './posts.schema';

export type AdminPostInput = z.infer<typeof adminPostInputSchema>;
export type PostListParams = z.infer<typeof postListParamsSchema>;
export type PublicPostTag = z.infer<typeof publicPostTagSchema>;
export type PublicPostListItem = z.infer<typeof publicPostListItemSchema>;
export type PublicPostListPage = z.infer<typeof publicPostListPageSchema>;
export type PublicPostDetail = z.infer<typeof publicPostDetailSchema>;
