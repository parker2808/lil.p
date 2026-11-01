import { AdminProcessStepsIndex } from '@/modules/admin-about/views/AdminProcessStepsIndex';

export default function AdminProcessPage() {
  return <AdminProcessStepsIndex />;
}

export function generateMetadata() {
  return { title: 'Process' };
}
