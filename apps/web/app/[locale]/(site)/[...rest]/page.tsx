import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';
import { getPage } from '@/modules/blocks/services/pages.service';
import { ApiError } from '@/modules/core/utils/api-error.util';
import { buildPageMetadata } from '@/modules/seo/utils/build-page-metadata.util';

import { customPageKey } from './custom-page.util';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}): Promise<Metadata> {
  const { locale, rest } = await params;
  const key = customPageKey(rest);
  if (!key) notFound();
  try {
    await getPage(key, locale as Locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return buildPageMetadata(key, params);
}

export default async function CustomSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, rest } = await params;
  setRequestLocale(locale);
  const key = customPageKey(rest);
  if (!key) notFound();
  const query = (await draftMode()).isEnabled ? await searchParams : undefined;
  try {
    return await BlocksPage({ pageKey: key, locale: locale as Locale, searchParams: query });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
