import type { Locale } from '@portfolio/contracts';
import type { ReactNode } from 'react';

import { SiteShell } from '@/modules/core/components/SiteShell/SiteShell';
import './public-round3.css';

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SiteShell locale={locale as Locale}>{children}</SiteShell>;
}
