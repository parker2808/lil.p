import type { Locale, PublicPage, PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { buildPageMetadata } from './build-page-metadata.util';
import { pageMetadata } from './page-metadata.util';

export function notesMetadata(input: {
  site: PublicSite;
  page: PublicPage;
  locale: Locale;
}): Metadata {
  return pageMetadata({ ...input, path: '/notes' });
}

export function buildNotesMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return buildPageMetadata('notes', params);
}
