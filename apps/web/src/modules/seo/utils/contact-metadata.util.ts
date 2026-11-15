import type { Locale, PublicPage, PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { buildPageMetadata } from './build-page-metadata.util';
import { pageMetadata } from './page-metadata.util';

export function contactMetadata(input: {
  site: PublicSite;
  page: PublicPage;
  locale: Locale;
}): Metadata {
  return pageMetadata({ ...input, path: '/contact' });
}

export function buildContactMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  return buildPageMetadata('contact', params, searchParams);
}
