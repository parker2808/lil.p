import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { listPublishedPostSlugs } from '@/modules/notes/services/posts.service';
import { NotesDetail } from '@/modules/notes/views/NotesDetail';
import { buildPostMetadata } from '@/modules/seo/utils/build-post-metadata.util';

export const revalidate = 3600;

export const generateMetadata = buildPostMetadata;

export async function generateStaticParams() {
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
  return <NotesDetail locale={locale as Locale} slug={slug} />;
}
