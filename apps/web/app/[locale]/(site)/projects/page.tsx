import type { Locale } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { ProjectsIndex } from '@/modules/projects/views/ProjectsIndex';
import { buildProjectsMetadata } from '@/modules/seo/utils/projects-metadata.util';

export const revalidate = 3600;

export const generateMetadata = buildProjectsMetadata;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Versioned CMS previews still read `?v=`; public filters are resolved in the browser.
  const query = (await draftMode()).isEnabled ? await searchParams : undefined;
  return <ProjectsIndex locale={locale as Locale} searchParams={query} />;
}
