import { type StatsRange, qk } from '@portfolio/contracts';
import { useSuspenseQuery } from '@tanstack/react-query';

import { fetchAdminHealth, fetchAdminStats } from '../services/dashboard.service';

export function useAdminStats(range: StatsRange) {
  return useSuspenseQuery({
    queryKey: qk.admin.stats(range),
    queryFn: () => fetchAdminStats(range),
  });
}

export function useAdminHealth() {
  return useSuspenseQuery({
    queryKey: qk.admin.health,
    queryFn: fetchAdminHealth,
  });
}
