import { AdminProjectsEditor } from '@/modules/admin-projects/views/AdminProjectsEditor';

export default async function AdminProjectEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminProjectsEditor projectId={Number(id)} />;
}

export function generateMetadata() {
  return { title: 'Edit project' };
}
