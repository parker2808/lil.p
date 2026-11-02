import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { DemoCraft } from '@/modules/design-demo/DemoSite';

export const metadata = { title: 'Craft — lil.p design demo' };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (process.env.DESIGN_DEMO !== '1') notFound();
  return <DemoCraft locale={locale as Locale} />;
}
