import { adminPageListItemSchema, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { AdminPagesIndex } from '@/modules/admin-pages/views/AdminPagesIndex';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

export default async function AdminPagesPage() {
  const queryClient = getQueryClient();
  await queryClient
    .prefetchQuery({
      queryKey: qk.admin.pages.list,
      queryFn: () =>
        apiServer('/api/admin/pages', {
          withAuth: true,
          schema: adminPageListItemSchema.array(),
        }),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminPagesIndex />
    </HydrationBoundary>
  );
}

export function generateMetadata() {
  return { title: 'Pages' };
}
