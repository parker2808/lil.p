import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@i18n/routing';
import { listPublishedPostSlugs } from '@/modules/notes/services/posts.service';
import { NotesDetail } from '@/modules/notes/views/NotesDetail';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const slugs = await listPublishedPostSlugs();
  return slugs.flatMap((slug) => routing.locales.map((locale) => ({ locale, slug })));
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
