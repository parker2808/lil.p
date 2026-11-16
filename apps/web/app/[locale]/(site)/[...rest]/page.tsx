import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode, headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';
import { getPage } from '@/modules/blocks/services/pages.service';
import { ApiError } from '@/modules/core/utils/api-error.util';
import { buildPageMetadata } from '@/modules/seo/utils/build-page-metadata.util';
import { tenantBrand } from '@/modules/blocks/utils/tenant-brand.util';

import { customPageKey } from './custom-page.util';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
  return buildPageMetadata(key, params, searchParams);
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
    const brand = tenantBrand((await headers()).get('host'), process.env.NEXT_PUBLIC_SITE_URL);
    return await BlocksPage({ pageKey: key, locale: locale as Locale, searchParams: query, brand });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
