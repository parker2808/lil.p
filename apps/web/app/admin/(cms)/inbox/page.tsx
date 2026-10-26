import {
  adminContactMessageListPageSchema,
  adminContactMessageListParamsSchema,
  qk,
} from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

import { AdminInboxIndex } from '@/modules/admin-inbox/views/AdminInboxIndex';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params = adminContactMessageListParamsSchema.parse({
    page: firstSearchParam(query.page),
    pageSize: firstSearchParam(query.pageSize),
    sort: firstSearchParam(query.sort),
    q: firstSearchParam(query.q),
    status: firstSearchParam(query.status),
  });
  const queryClient = getQueryClient();
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

  await queryClient
    .prefetchQuery({
      queryKey: qk.admin.list('messages', params),
      queryFn: () =>
        apiServer(`/api/admin/messages?${search.toString()}`, {
          withAuth: true,
          schema: adminContactMessageListPageSchema,
        }),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AdminInboxIndex />
      </Suspense>
    </HydrationBoundary>
  );
}
