import { AdminInsightsAudit } from '@/modules/admin-insights/views/AdminInsightsAudit';

export default function AdminAuditPage() {
  return <AdminInsightsAudit />;
}

export function generateMetadata() {
  return { title: 'Audit log' };
}
