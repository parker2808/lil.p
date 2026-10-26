import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { AboutIndex } from '@/modules/about/views/AboutIndex';
import { buildAboutMetadata } from '@/modules/seo/utils/about-metadata.util';

export const dynamic = 'force-dynamic';

export const generateMetadata = buildAboutMetadata;

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
  return <AboutIndex locale={locale as Locale} searchParams={query} />;
}
