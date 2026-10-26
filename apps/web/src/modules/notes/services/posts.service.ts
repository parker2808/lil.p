import 'server-only';

import {
  type Locale,
  type PostListParams,
  publicPostListPageSchema,
  type PublicPostListItem,
} from '@portfolio/contracts';

import { apiServer } from '@/modules/core/services/api-server.service';

export async function listPosts(
  locale: Locale,
  params: Partial<PostListParams> = {},
): Promise<PublicPostListItem[]> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      search.set(key, String(value));
    }
  }
  const suffix = search.size > 0 ? `?${search.toString()}` : '';
  const page = await apiServer(`/api/public/posts${suffix}`, {
    locale,
    tags: ['posts'],
    schema: publicPostListPageSchema,
  });
  return page.items;
}
