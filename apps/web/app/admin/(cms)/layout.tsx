import { type Me, meSchema } from '@portfolio/contracts';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminShell } from '@/modules/admin-core/components/AdminShell/AdminShell';
import { apiServer } from '@/modules/core/services/api-server.service';
import { ApiError } from '@/modules/core/utils/api-error.util';

export default async function AdminCmsLayout({ children }: { children: ReactNode }) {
  let me: Me;
  try {
    me = await apiServer('/api/auth/me', { withAuth: true, schema: meSchema });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/admin/login');
    }
    throw error;
  }

  return (
    <AdminShell me={me} crumbs={[{ label: me.name }]}>
      {children}
    </AdminShell>
  );
}
