import { type Locale, type PageKey, PAGE_PUBLIC_PATHS } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { getPage } from '@/modules/blocks/services/pages.service';
import { getSite } from '@/modules/core/services/site.service';

import { fallbackMetadata } from './fallback-metadata.util';
import { pageMetadata } from './page-metadata.util';

export async function buildPageMetadata(
  key: PageKey,
  params: Promise<{ locale: string }>,
): Promise<Metadata> {
  try {
    const { locale } = await params;
    const typed = locale as Locale;
    const [site, page] = await Promise.all([getSite(typed), getPage(key, typed)]);
    return pageMetadata({ site, page, locale: typed, path: PAGE_PUBLIC_PATHS[key] });
  } catch {
    return fallbackMetadata();
  }
}
