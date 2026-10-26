import {
  type AdminContactMessage,
  type AdminContactMessageListPage,
  adminContactMessageListPageSchema,
  type AdminContactMessageListParams,
  adminContactMessageSchema,
  type UnreadCount,
  unreadCountSchema,
  type UpdateContactMessageInput,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

export const LATEST_INBOX_PARAMS: AdminContactMessageListParams = {
  page: 1,
  pageSize: 5,
  sort: '-createdAt',
};

function queryString(params: AdminContactMessageListParams): string {
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
  return search.toString();
}

export function listAdminMessages(
  params: AdminContactMessageListParams,
): Promise<AdminContactMessageListPage> {
  return apiClient<AdminContactMessageListPage>(`/api/admin/messages?${queryString(params)}`).then(
    (data) => adminContactMessageListPageSchema.parse(data),
  );
}

export function getAdminMessage(id: number): Promise<AdminContactMessage> {
  return apiClient<AdminContactMessage>(`/api/admin/messages/${id}`).then((data) =>
    adminContactMessageSchema.parse(data),
  );
}

export function updateAdminMessage(
  id: number,
  body: UpdateContactMessageInput,
): Promise<AdminContactMessage> {
  return apiClient<AdminContactMessage>(`/api/admin/messages/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminContactMessageSchema.parse(data));
}

export function fetchUnreadCount(): Promise<UnreadCount> {
  return apiClient<UnreadCount>('/api/admin/messages/unread-count').then((data) =>
    unreadCountSchema.parse(data),
  );
}
