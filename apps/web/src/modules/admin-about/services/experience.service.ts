import {
  type AdminExperience,
  adminExperienceSchema,
  type AdminExperienceListPage,
  adminExperienceListPageSchema,
  type AdminExperienceListParams,
  type ExperienceCreateInput,
  type ExperienceUpdateInput,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

function queryString(params: AdminExperienceListParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));
  search.set('sort', params.sort);
  if (params.q) {
    search.set('q', params.q);
  }
  if (params.visible) {
    search.set('visible', params.visible);
  }
  return search.toString();
}

export function listAdminExperience(
  params: AdminExperienceListParams,
): Promise<AdminExperienceListPage> {
  return apiClient<AdminExperienceListPage>(`/api/admin/experience?${queryString(params)}`).then(
    (data) => adminExperienceListPageSchema.parse(data),
  );
}

export function getAdminExperience(id: number): Promise<AdminExperience> {
  return apiClient<AdminExperience>(`/api/admin/experience/${id}`).then((data) =>
    adminExperienceSchema.parse(data),
  );
}

export function createAdminExperience(body: ExperienceCreateInput): Promise<AdminExperience> {
  return apiClient<AdminExperience>('/api/admin/experience', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminExperienceSchema.parse(data));
}

export function updateAdminExperience(
  id: number,
  body: ExperienceUpdateInput,
): Promise<AdminExperience> {
  return apiClient<AdminExperience>(`/api/admin/experience/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminExperienceSchema.parse(data));
}

export function removeAdminExperience(id: number): Promise<AdminExperience> {
  return apiClient<AdminExperience>(`/api/admin/experience/${id}`, { method: 'DELETE' }).then(
    (data) => adminExperienceSchema.parse(data),
  );
}

export function reorderAdminExperience(ids: number[]): Promise<void> {
  return apiClient(`/api/admin/experience/order`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids }),
  }).then(() => undefined);
}
