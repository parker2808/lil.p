import { AdminPostsEditor } from '@/modules/admin-posts/views/AdminPostsEditor';

export default async function AdminPostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminPostsEditor postId={Number(id)} />;
}

export function generateMetadata() {
  return { title: 'Edit post' };
}
