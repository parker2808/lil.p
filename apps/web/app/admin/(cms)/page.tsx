import {
  adminAuditListPageSchema,
  adminHealthSchema,
  adminStatsSchema,
  meSchema,
  parseStatsRange,
  qk,
} from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { AdminDashboardIndex } from '@/modules/admin-dashboard/views/AdminDashboardIndex';
import { LATEST_AUDIT_PARAMS } from '@/modules/admin-insights/services/admin-audit.service';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function serverRenderTime(): number {
  return Date.now();
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const range = parseStatsRange(firstSearchParam(query.range));
  const queryClient = getQueryClient();
  const me = await apiServer('/api/auth/me', { withAuth: true, schema: meSchema });
  const renderedAt = serverRenderTime();

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
    ...(me.role === 'admin'
      ? [
          queryClient.prefetchQuery({
            queryKey: qk.admin.audit(LATEST_AUDIT_PARAMS),
            queryFn: () =>
              apiServer(`/api/admin/audit?limit=${LATEST_AUDIT_PARAMS.limit}`, {
                withAuth: true,
                schema: adminAuditListPageSchema,
              }),
          }),
        ]
      : []),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardIndex range={range} renderedAt={renderedAt} />
    </HydrationBoundary>
  );
}

export function generateMetadata() {
  return { title: 'Dashboard' };
}
