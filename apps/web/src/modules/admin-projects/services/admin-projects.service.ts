import {
  type AdminProject,
  adminProjectSchema,
  type AdminProjectListPage,
  adminProjectListPageSchema,
  type AdminProjectListParams,
  type ProjectUpdateInput,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

function queryString(params: AdminProjectListParams): string {
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
  if (params.domain) {
    search.set('domain', params.domain);
  }
  return search.toString();
}

export function listAdminProjects(params: AdminProjectListParams): Promise<AdminProjectListPage> {
  return apiClient<AdminProjectListPage>(`/api/admin/projects?${queryString(params)}`).then(
    (data) => adminProjectListPageSchema.parse(data),
  );
}

export function getAdminProject(id: number): Promise<AdminProject> {
  return apiClient<AdminProject>(`/api/admin/projects/${id}`).then((data) =>
    adminProjectSchema.parse(data),
  );
}

export function archiveAdminProject(id: number): Promise<AdminProject> {
  return apiClient<AdminProject>(`/api/admin/projects/${id}`, { method: 'DELETE' }).then((data) =>
    adminProjectSchema.parse(data),
  );
}

export function updateAdminProject(id: number, body: ProjectUpdateInput): Promise<AdminProject> {
  return apiClient<AdminProject>(`/api/admin/projects/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminProjectSchema.parse(data));
}

export function reorderAdminProjects(ids: number[]): Promise<void> {
  return apiClient(`/api/admin/projects/order`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids }),
  }).then(() => undefined);
}
