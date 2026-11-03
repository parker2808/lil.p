import { redirect } from 'next/navigation';

export default function AdminNewExperiencePage() {
  redirect('/admin/experience/new');
}

export function generateMetadata() {
  return { title: 'New experience' };
}
