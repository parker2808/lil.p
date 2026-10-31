import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { listPublishedSlugs } from '@/modules/projects/services/projects.service';
import { ProjectsDetail } from '@/modules/projects/views/ProjectsDetail';
import { buildProjectMetadata } from '@/modules/seo/utils/build-project-metadata.util';

export const revalidate = 3600;

export const generateMetadata = buildProjectMetadata;

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <ProjectsDetail locale={locale as Locale} slug={slug} />;
}
