import type { Locale } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { ProjectsIndex } from '@/modules/projects/views/ProjectsIndex';
import { DemoProjects } from '@/modules/design-demo/DemoSite';
import { buildProjectsMetadata } from '@/modules/seo/utils/projects-metadata.util';

export const revalidate = 3600;

export const generateMetadata =
  process.env.DESIGN_DEMO === '1'
    ? async () => ({ title: 'Projects — lil.parker design demo' })
    : buildProjectsMetadata;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (process.env.DESIGN_DEMO === '1') return <DemoProjects locale={locale as Locale} />;
  // Versioned CMS previews still read `?v=`; public filters are resolved in the browser.
  const query = (await draftMode()).isEnabled ? await searchParams : undefined;
  return <ProjectsIndex locale={locale as Locale} searchParams={query} />;
}
