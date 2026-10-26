import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { HomeIndex } from '@/modules/home/views/HomeIndex';
import { buildHomeMetadata } from '@/modules/seo/utils/home-metadata.util';

// Request-time fetch (D23). CI `next build` has no Nest process.
export const dynamic = 'force-dynamic';

export const generateMetadata = buildHomeMetadata;

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
  return <HomeIndex locale={locale as Locale} searchParams={query} />;
}
