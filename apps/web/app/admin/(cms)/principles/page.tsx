import { AdminPrinciplesIndex } from '@/modules/admin-about/views/AdminPrinciplesIndex';

export default function AdminPrinciplesPage() {
  return <AdminPrinciplesIndex />;
}

export function generateMetadata() {
  return { title: 'Principles' };
}
