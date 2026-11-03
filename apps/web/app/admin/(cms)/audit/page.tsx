import { meSchema } from '@portfolio/contracts';
import { notFound } from 'next/navigation';

import { AdminInsightsAudit } from '@/modules/admin-insights/views/AdminInsightsAudit';
import { apiServer } from '@/modules/core/services/api-server.service';

export default async function AdminAuditPage() {
  const me = await apiServer('/api/auth/me', { withAuth: true, schema: meSchema });
  if (me.role !== 'admin') notFound();
  return <AdminInsightsAudit />;
}

export function generateMetadata() {
  return { title: 'Audit log' };
}
