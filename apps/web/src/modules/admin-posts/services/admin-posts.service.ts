import {
  type AdminPost,
  adminPostSchema,
  type AdminPostListPage,
  adminPostListPageSchema,
  type AdminPostListParams,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

function queryString(params: AdminPostListParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));
  search.set('sort', params.sort);
  if (params.q) {
    search.set('q', params.q);
  }
  if (params.status) {
    search.set('status', params.status);
  }
  if (params.tag) {
    search.set('tag', params.tag);
  }
  return search.toString();
}

export function listAdminPosts(params: AdminPostListParams): Promise<AdminPostListPage> {
  return apiClient<AdminPostListPage>(`/api/admin/posts?${queryString(params)}`).then((data) =>
    adminPostListPageSchema.parse(data),
  );
}

export function getAdminPost(id: number): Promise<AdminPost> {
  return apiClient<AdminPost>(`/api/admin/posts/${id}`).then((data) => adminPostSchema.parse(data));
}

export function archiveAdminPost(id: number): Promise<AdminPost> {
  return apiClient<AdminPost>(`/api/admin/posts/${id}`, { method: 'DELETE' }).then((data) =>
    adminPostSchema.parse(data),
  );
}
