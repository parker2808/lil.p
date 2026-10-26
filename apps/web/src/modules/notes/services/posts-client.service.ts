import type { Locale, PostListParams, PublicPostListPage } from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

function queryString(locale: Locale, params: Partial<PostListParams>): string {
  const search = new URLSearchParams();
  search.set('locale', locale);
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      search.set(key, String(value));
    }
  }
  return `?${search.toString()}`;
}

export function listPostsPageClient(
  locale: Locale,
  params: Partial<PostListParams>,
  signal?: AbortSignal,
): Promise<PublicPostListPage> {
  return apiClient(`/api/public/posts${queryString(locale, params)}`, { signal });
}
