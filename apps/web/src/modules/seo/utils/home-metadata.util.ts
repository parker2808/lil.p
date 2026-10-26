import type { Locale, PublicPage, PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { buildPageMetadata } from './build-page-metadata.util';
import { pageMetadata } from './page-metadata.util';

export function homeMetadata(input: {
  site: PublicSite;
  page: PublicPage;
  locale: Locale;
}): Metadata {
  return pageMetadata({ ...input, path: '/' });
}

export function buildHomeMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return buildPageMetadata('home', params);
}
