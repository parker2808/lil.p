import { adminPageSchema, pageKeySchema, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { AdminAboutTabs } from '@/modules/admin-pages/views/AdminAboutTabs';
import { AdminPagesEditor } from '@/modules/admin-pages/views/AdminPagesEditor';
import { apiServer } from '@/modules/core/services/api-server.service';
import { getQueryClient } from '@/modules/core/utils/query-client.util';

export default async function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const parsed = pageKeySchema.safeParse(key);
  if (!parsed.success) {
    notFound();
  }

  const queryClient = getQueryClient();
  await queryClient
    .prefetchQuery({
      queryKey: qk.admin.pages.detail(parsed.data),
      queryFn: () =>
        apiServer(`/api/admin/pages/${parsed.data}`, {
          withAuth: true,
          schema: adminPageSchema,
        }),
    })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        {parsed.data === 'about' ? (
          <AdminAboutTabs layout={<AdminPagesEditor pageKey={parsed.data} />} />
        ) : (
          <AdminPagesEditor pageKey={parsed.data} />
        )}
      </Suspense>
    </HydrationBoundary>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const name = key.charAt(0).toUpperCase() + key.slice(1);
  return { title: `Edit ${name} page` };
}
