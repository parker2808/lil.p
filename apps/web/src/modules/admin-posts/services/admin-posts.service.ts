import {
  type AdminPost,
  adminPostSchema,
  type AdminPostListPage,
  adminPostListPageSchema,
  type AdminPostListParams,
  type PostCreateInput,
  type PostUpdateInput,
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

export function createAdminPost(body: PostCreateInput): Promise<AdminPost> {
  return apiClient<AdminPost>('/api/admin/posts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminPostSchema.parse(data));
}

export function publishAdminPost(id: number): Promise<AdminPost> {
  return apiClient<AdminPost>(`/api/admin/posts/${id}/publish`, { method: 'POST' }).then((data) =>
    adminPostSchema.parse(data),
  );
}

export function unpublishAdminPost(id: number): Promise<AdminPost> {
  return apiClient<AdminPost>(`/api/admin/posts/${id}/unpublish`, { method: 'POST' }).then((data) =>
    adminPostSchema.parse(data),
  );
}

export function updateAdminPost(id: number, body: PostUpdateInput): Promise<AdminPost> {
  return apiClient<AdminPost>(`/api/admin/posts/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminPostSchema.parse(data));
}
