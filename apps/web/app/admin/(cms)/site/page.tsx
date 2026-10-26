import { Suspense } from 'react';

import { AdminSiteIndex } from '@/modules/admin-site/views/AdminSiteIndex';

export default function AdminSitePage() {
  return (
    <Suspense>
      <AdminSiteIndex />
    </Suspense>
  );
}
