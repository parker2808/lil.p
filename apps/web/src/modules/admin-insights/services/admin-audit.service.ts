import {
  type AdminAuditListPage,
  adminAuditListPageSchema,
  type AdminAuditListParams,
  type BulkStatusAction,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

function queryString(params: AdminAuditListParams): string {
  const search = new URLSearchParams();
  search.set('limit', String(params.limit));
  if (params.cursor) {
    search.set('cursor', String(params.cursor));
  }
  if (params.entityType) {
    search.set('entityType', params.entityType);
  }
  if (params.userId) {
    search.set('userId', String(params.userId));
  }
  return search.toString();
}

export function listAdminAudit(params: AdminAuditListParams): Promise<AdminAuditListPage> {
  return apiClient<AdminAuditListPage>(`/api/admin/audit?${queryString(params)}`).then((data) =>
    adminAuditListPageSchema.parse(data),
  );
}

export const LATEST_AUDIT_PARAMS: AdminAuditListParams = { limit: 8 };

export function bulkAdminProjects(
  ids: number[],
  action: BulkStatusAction,
): Promise<{ count: number }> {
  return apiClient<{ count: number }>('/api/admin/projects/bulk', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids, action }),
  });
}

export function bulkAdminPosts(
  ids: number[],
  action: BulkStatusAction,
): Promise<{ count: number }> {
  return apiClient<{ count: number }>('/api/admin/posts/bulk', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids, action }),
  });
}
