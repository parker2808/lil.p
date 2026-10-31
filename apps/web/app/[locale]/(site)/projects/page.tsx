import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { ProjectsIndex } from '@/modules/projects/views/ProjectsIndex';
import { buildProjectsMetadata } from '@/modules/seo/utils/projects-metadata.util';

// Filters live in searchParams, so render per request. Declared, not inferred: with the API
// down at build Next never renders this page and would call it static. Public fetches set
// their own `revalidate`, so they still hit the data cache.
export const dynamic = 'force-dynamic';

export const generateMetadata = buildProjectsMetadata;

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
  return <ProjectsIndex locale={locale as Locale} searchParams={query} />;
}
