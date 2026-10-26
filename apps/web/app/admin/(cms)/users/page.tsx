import { adminUserListPageSchema, adminUserListParamsSchema, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

import { AdminUsersIndex } from '@/modules/admin-users/views/AdminUsersIndex';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params = adminUserListParamsSchema.parse({
    page: firstSearchParam(query.page),
    pageSize: firstSearchParam(query.pageSize),
    sort: firstSearchParam(query.sort),
    q: firstSearchParam(query.q),
  });
  const queryClient = getQueryClient();
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));
  search.set('sort', params.sort);
  if (params.q) {
    search.set('q', params.q);
  }

  await queryClient
    .prefetchQuery({
      queryKey: qk.admin.list('users', params),
      queryFn: () =>
        apiServer(`/api/admin/users?${search.toString()}`, {
          withAuth: true,
          schema: adminUserListPageSchema,
        }),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AdminUsersIndex />
      </Suspense>
    </HydrationBoundary>
  );
}
