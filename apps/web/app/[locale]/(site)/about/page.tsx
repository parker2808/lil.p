import type { Locale } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { AboutIndex } from '@/modules/about/views/AboutIndex';
import { buildAboutMetadata } from '@/modules/seo/utils/about-metadata.util';

export const revalidate = 3600;

export const generateMetadata = buildAboutMetadata;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Only draft previews read `?v=`; awaiting searchParams otherwise would make the page dynamic.
  const query = (await draftMode()).isEnabled ? await searchParams : undefined;
  return <AboutIndex locale={locale as Locale} searchParams={query} />;
}
