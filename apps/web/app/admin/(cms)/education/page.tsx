import { AdminEducationIndex } from '@/modules/admin-about/views/AdminEducationIndex';

export default function AdminEducationPage() {
  return <AdminEducationIndex />;
}

export function generateMetadata() {
  return { title: 'Education' };
}
