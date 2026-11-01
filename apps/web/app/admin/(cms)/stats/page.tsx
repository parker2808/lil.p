import { AdminProfileStatsIndex } from '@/modules/admin-about/views/AdminProfileStatsIndex';

export default function AdminStatsPage() {
  return <AdminProfileStatsIndex />;
}

export function generateMetadata() {
  return { title: 'Stats' };
}
