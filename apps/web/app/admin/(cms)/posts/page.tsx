import { adminPostListPageSchema, adminPostListParamsSchema, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { AdminPostsIndex } from '@/modules/admin-posts/views/AdminPostsIndex';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPostsPage({
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
    tag: firstSearchParam(query.tag),
  };
  const params = adminPostListParamsSchema.parse(raw);
  const queryClient = getQueryClient();
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));
  search.set('sort', params.sort);
  if (params.q) search.set('q', params.q);
  if (params.status) search.set('status', params.status);
  if (params.tag) search.set('tag', params.tag);

  await queryClient
    .prefetchQuery({
      queryKey: qk.admin.list('posts', params),
      queryFn: () =>
        apiServer(`/api/admin/posts?${search.toString()}`, {
          withAuth: true,
          schema: adminPostListPageSchema,
        }),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminPostsIndex />
    </HydrationBoundary>
  );
}
