import {
  type AdminMedia,
  type AdminMediaListPage,
  adminMediaListPageSchema,
  adminMediaSchema,
  type UpdateMediaInput,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

export function listAdminMedia(cursor?: number, limit = 40): Promise<AdminMediaListPage> {
  const search = new URLSearchParams();
  search.set('limit', String(limit));
  if (cursor) {
    search.set('cursor', String(cursor));
  }
  return apiClient<AdminMediaListPage>(`/api/admin/media?${search.toString()}`).then((data) =>
    adminMediaListPageSchema.parse(data),
  );
}

export function updateAdminMedia(id: number, body: UpdateMediaInput): Promise<AdminMedia> {
  return apiClient<AdminMedia>(`/api/admin/media/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminMediaSchema.parse(data));
}

export function removeAdminMedia(id: number): Promise<void> {
  return apiClient<void>(`/api/admin/media/${id}`, { method: 'DELETE' });
}

export function publicMediaSrc(fileName: string): string {
  return `/api/public/media/${fileName}`;
}
