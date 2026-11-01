import { type ReactNode, Suspense } from 'react';

import { AdminInboxLayout } from '@/modules/admin-inbox/views/AdminInboxLayout';

export default function AdminInboxRouteLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AdminInboxLayout>{children}</AdminInboxLayout>
    </Suspense>
  );
}
