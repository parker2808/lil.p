import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { pageKeySchema, type Locale } from '@portfolio/contracts';
import { BlocksPage } from '@/modules/blocks/views/BlocksPage';
import { getPage } from '@/modules/blocks/services/pages.service';
import { buildPageMetadata } from '@/modules/seo/utils/build-page-metadata.util';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}): Promise<Metadata> {
  const { locale, rest } = await params;
  if (rest.length === 1 && pageKeySchema.safeParse(rest[0]).success) {
    return buildPageMetadata(rest[0]!, Promise.resolve({ locale }));
  }
  const t = await getTranslations({ locale, namespace: 'states' });
  return { title: t('notFound') };
}

export default async function UnknownSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, rest } = await params;
  const key = rest.length === 1 ? rest[0] : undefined;
  if (!key || !pageKeySchema.safeParse(key).success) notFound();
  setRequestLocale(locale);
  const query = (await draftMode()).isEnabled ? await searchParams : undefined;
  try {
    await getPage(key, locale as Locale);
  } catch {
    notFound();
  }
  return <BlocksPage pageKey={key} locale={locale as Locale} searchParams={query} />;
}
