import { AdminDomainsIndex } from '@/modules/admin-taxonomy/views/AdminDomainsIndex';

export default function AdminDomainsPage() {
  return <AdminDomainsIndex />;
}

export function generateMetadata() {
  return { title: 'Domains' };
}
