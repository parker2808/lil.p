import {
  type AdminBlock,
  adminBlockSchema,
  type AdminPage,
  adminPageListItemSchema,
  type AdminPageListItem,
  adminPageSchema,
  adminPageVersionListItemSchema,
  adminPageVersionSchema,
  type BlockCreateInput,
  type BlockUpdateInput,
  type PageKey,
  type PageUpdateInput,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

export function listAdminPages(): Promise<AdminPageListItem[]> {
  return apiClient<AdminPageListItem[]>('/api/admin/pages').then((data) =>
    adminPageListItemSchema.array().parse(data),
  );
}

export function getAdminPage(key: PageKey): Promise<AdminPage> {
  return apiClient<AdminPage>(`/api/admin/pages/${key}`).then((data) =>
    adminPageSchema.parse(data),
  );
}

export function updateAdminPage(key: PageKey, body: PageUpdateInput): Promise<AdminPage> {
  return apiClient<AdminPage>(`/api/admin/pages/${key}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminPageSchema.parse(data));
}

export function createAdminBlock(key: PageKey, body: BlockCreateInput): Promise<AdminBlock> {
  return apiClient<AdminBlock>(`/api/admin/pages/${key}/blocks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminBlockSchema.parse(data));
}

export function updateAdminBlock(
  key: PageKey,
  id: number,
  body: BlockUpdateInput,
): Promise<AdminBlock> {
  return apiClient<AdminBlock>(`/api/admin/pages/${key}/blocks/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminBlockSchema.parse(data));
}

export function duplicateAdminBlock(key: PageKey, id: number): Promise<AdminBlock> {
  return apiClient<AdminBlock>(`/api/admin/pages/${key}/blocks/${id}/duplicate`, {
    method: 'POST',
  }).then((data) => adminBlockSchema.parse(data));
}

export function deleteAdminBlock(key: PageKey, id: number): Promise<AdminBlock> {
  return apiClient<AdminBlock>(`/api/admin/pages/${key}/blocks/${id}`, {
    method: 'DELETE',
  }).then((data) => adminBlockSchema.parse(data));
}

export function publishAdminPage(key: PageKey, body: { note?: string } = {}): Promise<AdminPage> {
  return apiClient<AdminPage>(`/api/admin/pages/${key}/publish`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminPageSchema.parse(data));
}

export function discardAdminPage(key: PageKey): Promise<AdminPage> {
  return apiClient<AdminPage>(`/api/admin/pages/${key}/discard`, {
    method: 'POST',
  }).then((data) => adminPageSchema.parse(data));
}

export function listAdminPageVersions(key: PageKey) {
  return apiClient(`/api/admin/pages/${key}/versions`).then((data) =>
    adminPageVersionListItemSchema.array().parse(data),
  );
}

export function getAdminPageVersion(key: PageKey, version: number) {
  return apiClient(`/api/admin/pages/${key}/versions/${version}`).then((data) =>
    adminPageVersionSchema.parse(data),
  );
}

export function restoreAdminPage(key: PageKey, version: number): Promise<AdminPage> {
  return apiClient<AdminPage>(`/api/admin/pages/${key}/versions/${version}/restore`, {
    method: 'POST',
  }).then((data) => adminPageSchema.parse(data));
}

export function reorderAdminBlocks(key: PageKey, ids: number[]): Promise<AdminPage> {
  return apiClient<AdminPage>(`/api/admin/pages/${key}/blocks/order`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids }),
  }).then((data) => adminPageSchema.parse(data));
}
