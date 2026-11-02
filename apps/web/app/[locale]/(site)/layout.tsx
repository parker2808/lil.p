import type { Locale } from '@portfolio/contracts';
import type { ReactNode } from 'react';

import { SiteShell } from '@/modules/core/components/SiteShell/SiteShell';
import { DemoShell } from '@/modules/design-demo/DemoSite';

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (process.env.DESIGN_DEMO === '1') {
    return <DemoShell locale={locale as Locale}>{children}</DemoShell>;
  }
  return <SiteShell locale={locale as Locale}>{children}</SiteShell>;
}
