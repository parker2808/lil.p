import { AdminInboxIndex } from '@/modules/admin-inbox/views/AdminInboxIndex';

export default function AdminInboxPage() {
  return <AdminInboxIndex />;
}

export function generateMetadata() {
  return { title: 'Inbox' };
}
