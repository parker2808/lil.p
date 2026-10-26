import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { ProjectsIndex } from '@/modules/projects/views/ProjectsIndex';
import { buildProjectsMetadata } from '@/modules/seo/utils/projects-metadata.util';

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
