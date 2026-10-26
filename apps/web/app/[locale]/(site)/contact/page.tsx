import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { ContactIndex } from '@/modules/contact/views/ContactIndex';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  return <ContactIndex locale={locale as Locale} searchParams={query} />;
}
