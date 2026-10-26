import { adminHealthSchema, adminStatsSchema, parseStatsRange, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { AdminDashboardIndex } from '@/modules/admin-dashboard/views/AdminDashboardIndex';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const range = parseStatsRange(firstSearchParam(query.range));
  const queryClient = getQueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: qk.admin.stats(range),
      queryFn: () =>
        apiServer(`/api/admin/stats?range=${range}`, {
          withAuth: true,
          schema: adminStatsSchema,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: qk.admin.health,
      queryFn: () => apiServer('/api/admin/health', { withAuth: true, schema: adminHealthSchema }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardIndex range={range} />
    </HydrationBoundary>
  );
}
