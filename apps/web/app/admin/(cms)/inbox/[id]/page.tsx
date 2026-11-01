import { adminContactMessageSchema, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { AdminInboxDetail } from '@/modules/admin-inbox/views/AdminInboxDetail';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

export default async function AdminInboxDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }

  const queryClient = getQueryClient();
  await queryClient
    .prefetchQuery({
      queryKey: qk.admin.detail('messages', id),
      queryFn: () =>
        apiServer(`/api/admin/messages/${id}`, {
          withAuth: true,
          schema: adminContactMessageSchema,
        }),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AdminInboxDetail id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}

export function generateMetadata() {
  return { title: 'Message' };
}
