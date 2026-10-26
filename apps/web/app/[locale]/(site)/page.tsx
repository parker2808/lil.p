import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { HomeIndex } from '@/modules/home/views/HomeIndex';

// Request-time fetch (D23). CI `next build` has no Nest process.
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeIndex locale={locale as Locale} />;
}
