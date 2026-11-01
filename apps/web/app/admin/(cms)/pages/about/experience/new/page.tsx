import { AdminAboutExperienceEditor } from '@/modules/admin-about/views/AdminAboutExperienceEditor';

export default function AdminNewExperiencePage() {
  return <AdminAboutExperienceEditor experienceId={null} />;
}

export function generateMetadata() {
  return { title: 'New experience' };
}
