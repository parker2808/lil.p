import type { Locale, PublicPage, PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { buildPageMetadata } from './build-page-metadata.util';
import { pageMetadata } from './page-metadata.util';

export function projectsMetadata(input: {
  site: PublicSite;
  page: PublicPage;
  locale: Locale;
}): Metadata {
  return pageMetadata({ ...input, path: '/projects' });
}

export function buildProjectsMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return buildPageMetadata('projects', params);
}
