import { AdminPostsEditor } from '@/modules/admin-posts/views/AdminPostsEditor';

export default function AdminNewPostPage() {
  return <AdminPostsEditor postId={null} />;
}

export function generateMetadata() {
  return { title: 'New post' };
}
