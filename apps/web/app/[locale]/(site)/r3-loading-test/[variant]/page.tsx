import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { PublicRouteSkeleton } from '@/modules/core/components/PublicRouteSkeleton/PublicRouteSkeleton';
import { RadioKeyboardFixture } from '@/modules/admin-core/components/RadioKeyboardFixture/RadioKeyboardFixture';

import ProjectsLoading from '../../projects/loading';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'lil.parker' };

const variants = [
  'home',
  'projects',
  'notes',
  'about',
  'contact',
  'craft',
  'project',
  'note',
  'radio',
] as const;

export default async function LoadingFixture({ params }: { params: Promise<{ variant: string }> }) {
  if (process.env.R3_E2E_STATES !== '1') notFound();
  const { variant } = await params;
  const selected = variants.find((item) => item === variant);
  if (!selected) notFound();
  if (selected === 'radio') return <RadioKeyboardFixture />;
  if (selected === 'projects') return <ProjectsLoading />;
  return <PublicRouteSkeleton variant={selected} />;
}
