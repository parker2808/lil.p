import '@parker2808/cms-core/theme.css';

import { notFound } from 'next/navigation';

import { BuilderShell } from '@/modules/admin-pages/builder/BuilderShell';

export default async function BuilderPage({ params }: { params: Promise<{ key: string }> }) {
  if (process.env.R3_E2E_STATES !== '1') notFound();
  const { key } = await params;
  if (!/^[a-z0-9][a-z0-9-]{0,95}$/.test(key)) notFound();
  return <BuilderShell pageKey={key} />;
}

export const metadata = { robots: { index: false, follow: false } };
