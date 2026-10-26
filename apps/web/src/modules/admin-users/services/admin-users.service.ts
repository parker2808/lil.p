import {
  type AdminUser,
  type AdminUserListPage,
  adminUserListPageSchema,
  type AdminUserListParams,
  adminUserSchema,
  type CreateUserInput,
  type SetPasswordInput,
  type UpdateUserInput,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

function queryString(params: AdminUserListParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));
  search.set('sort', params.sort);
  if (params.q) {
    search.set('q', params.q);
  }
  return search.toString();
}

export function listAdminUsers(params: AdminUserListParams): Promise<AdminUserListPage> {
  return apiClient<AdminUserListPage>(`/api/admin/users?${queryString(params)}`).then((data) =>
    adminUserListPageSchema.parse(data),
  );
}

export function createAdminUser(body: CreateUserInput): Promise<AdminUser> {
  return apiClient<AdminUser>('/api/admin/users', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminUserSchema.parse(data));
}

export function updateAdminUser(id: number, body: UpdateUserInput): Promise<AdminUser> {
  return apiClient<AdminUser>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminUserSchema.parse(data));
}

export function signOutAdminUser(id: number): Promise<void> {
  return apiClient(`/api/admin/users/${id}/sign-out-everywhere`, { method: 'POST' }).then(
    () => undefined,
  );
}

export function setAdminUserPassword(id: number, body: SetPasswordInput): Promise<void> {
  return apiClient(`/api/admin/users/${id}/password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then(() => undefined);
}
