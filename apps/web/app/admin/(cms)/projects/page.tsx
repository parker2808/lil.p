import { adminProjectListPageSchema, adminProjectListParamsSchema, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { AdminProjectsIndex } from '@/modules/admin-projects/views/AdminProjectsIndex';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = {
    page: firstSearchParam(query.page),
    pageSize: firstSearchParam(query.pageSize),
    sort: firstSearchParam(query.sort),
    q: firstSearchParam(query.q),
    status: firstSearchParam(query.status),
    domain: firstSearchParam(query.domain),
  };
  const params = adminProjectListParamsSchema.parse(raw);
  const queryClient = getQueryClient();
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));
  search.set('sort', params.sort);
  if (params.q) search.set('q', params.q);
  if (params.status) search.set('status', params.status);
  if (params.domain) search.set('domain', params.domain);

  await queryClient
    .prefetchQuery({
      queryKey: qk.admin.list('projects', params),
      queryFn: () =>
        apiServer(`/api/admin/projects?${search.toString()}`, {
          withAuth: true,
          schema: adminProjectListPageSchema,
        }),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminProjectsIndex />
    </HydrationBoundary>
  );
}
