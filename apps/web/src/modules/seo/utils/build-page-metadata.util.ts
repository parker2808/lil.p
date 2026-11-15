import { type Locale, type PageKey, publicPagePathForKey } from '@portfolio/contracts';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';

import { getPage } from '@/modules/blocks/services/pages.service';
import { previewVersion } from '@/modules/blocks/utils/preview-version.util';
import { getSite } from '@/modules/core/services/site.service';

import { fallbackMetadata } from './fallback-metadata.util';
import { pageMetadata } from './page-metadata.util';

export async function buildPageMetadata(
  key: PageKey,
  params: Promise<{ locale: string }>,
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
): Promise<Metadata> {
  try {
    const { locale } = await params;
    const typed = locale as Locale;
    const version = (await draftMode()).isEnabled ? previewVersion(await searchParams) : undefined;
    const [site, page] = await Promise.all([getSite(typed), getPage(key, typed, version)]);
    return pageMetadata({
      site,
      page: 'tree' in page ? { ...page, blocks: [] } : page,
      locale: typed,
      path: publicPagePathForKey(key),
    });
  } catch {
    return fallbackMetadata();
  }
}
