import { redirect } from 'next/navigation';

export default async function AdminExperienceEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/experience/${id}`);
}

export function generateMetadata() {
  return { title: 'Edit experience' };
}
