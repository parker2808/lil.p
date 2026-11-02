import type { Locale } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { AboutIndex } from '@/modules/about/views/AboutIndex';
import { DemoAbout } from '@/modules/design-demo/DemoMore';
import { buildAboutMetadata } from '@/modules/seo/utils/about-metadata.util';

export const revalidate = 3600;

export const generateMetadata =
  process.env.DESIGN_DEMO === '1'
    ? async () => ({ title: 'About — lil.parker' })
    : buildAboutMetadata;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (process.env.DESIGN_DEMO === '1') return <DemoAbout locale={locale as Locale} />;
  // Only draft previews read `?v=`; awaiting searchParams otherwise would make the page dynamic.
  const query = (await draftMode()).isEnabled ? await searchParams : undefined;
  return <AboutIndex locale={locale as Locale} searchParams={query} />;
}
