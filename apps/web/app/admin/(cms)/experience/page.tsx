import {
  adminExperienceListPageSchema,
  adminExperienceListParamsSchema,
  qk,
} from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { AdminAboutExperienceIndex } from '@/modules/admin-about/views/AdminAboutExperienceIndex';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminExperiencePage({
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
    visible: firstSearchParam(query.visible),
  };
  const params = adminExperienceListParamsSchema.parse(raw);
  const queryClient = getQueryClient();
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));
  search.set('sort', params.sort);
  if (params.q) search.set('q', params.q);
  if (params.visible) search.set('visible', params.visible);

  await queryClient
    .prefetchQuery({
      queryKey: qk.admin.list('experience', params),
      queryFn: () =>
        apiServer(`/api/admin/experience?${search.toString()}`, {
          withAuth: true,
          schema: adminExperienceListPageSchema,
        }),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminAboutExperienceIndex />
    </HydrationBoundary>
  );
}

export function generateMetadata() {
  return { title: 'Experience' };
}
