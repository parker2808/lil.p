import { adminStatsSchema, parseStatsRange, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { AdminInsightsAnalytics } from '@/modules/admin-insights/views/AdminInsightsAnalytics';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminAnalyticsPage({
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
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminInsightsAnalytics range={range} />
    </HydrationBoundary>
  );
}

export function generateMetadata() {
  return { title: 'Analytics' };
}
