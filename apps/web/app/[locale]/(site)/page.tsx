import type { Locale } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { HomeIndex } from '@/modules/home/views/HomeIndex';
import { DemoHome } from '@/modules/design-demo/DemoSite';
import { buildHomeMetadata } from '@/modules/seo/utils/home-metadata.util';

export const revalidate = 3600;

export const generateMetadata =
  process.env.DESIGN_DEMO === '1'
    ? async () => ({ title: 'lil.parker — Design demo' })
    : buildHomeMetadata;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (process.env.DESIGN_DEMO === '1') return <DemoHome locale={locale as Locale} />;
  // Only draft previews read `?v=`; awaiting searchParams otherwise would make the page dynamic.
  const query = (await draftMode()).isEnabled ? await searchParams : undefined;
  return <HomeIndex locale={locale as Locale} searchParams={query} />;
}
