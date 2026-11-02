import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { listPublishedPostSlugs } from '@/modules/notes/services/posts.service';
import { NotesDetail } from '@/modules/notes/views/NotesDetail';
import { DemoNoteDetail, demoNoteSlugs } from '@/modules/design-demo/DemoMore';
import { buildPostMetadata } from '@/modules/seo/utils/build-post-metadata.util';

export const revalidate = 3600;

export const generateMetadata =
  process.env.DESIGN_DEMO === '1'
    ? async () => ({ title: 'Note — lil.parker' })
    : buildPostMetadata;

export async function generateStaticParams() {
  if (process.env.DESIGN_DEMO === '1') return [];
  const slugs = await listPublishedPostSlugs();
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
    if (!demoNoteSlugs.includes(slug)) notFound();
    return <DemoNoteDetail locale={locale as Locale} slug={slug} />;
  }
  return <NotesDetail locale={locale as Locale} slug={slug} />;
}
