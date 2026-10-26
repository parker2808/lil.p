import {
  type AdminHealth,
  adminHealthSchema,
  type AdminStats,
  adminStatsSchema,
  type StatsRange,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

export function fetchAdminStats(range: StatsRange): Promise<AdminStats> {
  return apiClient<AdminStats>(`/api/admin/stats?range=${range}`).then((data) =>
    adminStatsSchema.parse(data),
  );
}

export function fetchAdminHealth(): Promise<AdminHealth> {
  return apiClient<AdminHealth>('/api/admin/health').then((data) => adminHealthSchema.parse(data));
}
