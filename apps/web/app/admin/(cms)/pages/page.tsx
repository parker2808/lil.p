import { adminPageListItemSchema, qk } from '@portfolio/contracts';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

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

export async function generateMetadata() {
  const locale = (await cookies()).get('NEXT_LOCALE')?.value === 'vi' ? 'vi' : 'en';
  const t = await getTranslations({ locale, namespace: 'admin.pages' });
  return { title: t('title') };
}
