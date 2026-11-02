import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { listPublishedSlugs } from '@/modules/projects/services/projects.service';
import { ProjectsDetail } from '@/modules/projects/views/ProjectsDetail';
import { DemoDetail } from '@/modules/design-demo/DemoSite';
import { demoProjects } from '@/modules/design-demo/data';
import { buildProjectMetadata } from '@/modules/seo/utils/build-project-metadata.util';

export const revalidate = 3600;

export const generateMetadata =
  process.env.DESIGN_DEMO === '1'
    ? async () => ({ title: 'Case study — lil.parker design demo' })
    : buildProjectMetadata;

export async function generateStaticParams() {
  if (process.env.DESIGN_DEMO === '1') return [];
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
  if (process.env.DESIGN_DEMO === '1') {
    if (!demoProjects(locale as Locale).some((project) => project.slug === slug)) notFound();
    return <DemoDetail locale={locale as Locale} slug={slug} />;
  }
  return <ProjectsDetail locale={locale as Locale} slug={slug} />;
}
