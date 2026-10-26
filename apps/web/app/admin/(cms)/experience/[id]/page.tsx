import { AdminAboutExperienceEditor } from '@/modules/admin-about/views/AdminAboutExperienceEditor';

export default async function AdminExperienceEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminAboutExperienceEditor experienceId={Number(id)} />;
}
