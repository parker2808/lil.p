import { AdminSiteProfile } from '@/modules/admin-site/views/AdminSiteProfile';

export default function AdminProfilePage() {
  return <AdminSiteProfile />;
}

export function generateMetadata() {
  return { title: 'Profile' };
}
