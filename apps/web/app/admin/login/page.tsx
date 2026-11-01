import { Suspense } from 'react';

import { AdminAuthLogin } from '@/modules/admin-auth/views/AdminAuthLogin';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminAuthLogin />
    </Suspense>
  );
}

export function generateMetadata() {
  return { title: 'Sign in' };
}
