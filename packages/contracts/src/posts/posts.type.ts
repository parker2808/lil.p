import type { z } from 'zod';

import type {
  adminPostInputSchema,
  adminPostListItemSchema,
  adminPostListPageSchema,
  adminPostListParamsSchema,
  adminPostListTagSchema,
  adminPostSchema,
  postCreateSchema,
  postListParamsSchema,
  postUpdateSchema,
  publicPostDetailSchema,
  publicPostListItemSchema,
  publicPostListPageSchema,
  publicPostTagSchema,
} from './posts.schema';

export type AdminPostInput = z.infer<typeof adminPostInputSchema>;
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type AdminPost = z.infer<typeof adminPostSchema>;
export type AdminPostListTag = z.infer<typeof adminPostListTagSchema>;
export type AdminPostListItem = z.infer<typeof adminPostListItemSchema>;
export type AdminPostListPage = z.infer<typeof adminPostListPageSchema>;
export type AdminPostListParams = z.infer<typeof adminPostListParamsSchema>;
export type PostListParams = z.infer<typeof postListParamsSchema>;
export type PublicPostTag = z.infer<typeof publicPostTagSchema>;
export type PublicPostListItem = z.infer<typeof publicPostListItemSchema>;
export type PublicPostListPage = z.infer<typeof publicPostListPageSchema>;
export type PublicPostDetail = z.infer<typeof publicPostDetailSchema>;
