import type { Locale, PublicProjectDetail, PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { buildAlternates } from './alternates.util';
import { absoluteUrl, metadataBase } from './site-url.util';
import { firstText, formatTitle } from './title.util';

export function projectMetadata({
  site,
  project,
  locale,
}: {
  site: PublicSite;
  project: PublicProjectDetail;
  locale: Locale;
}): Metadata {
  const path = `/projects/${project.slug}`;
  const title = firstText(project.seoTitle, project.title) ?? site.settings.siteName;
  const description = firstText(
    project.seoDescription,
    project.tagline,
    site.settings.seoDescription,
  );
  const formatted = formatTitle(title, site.settings.siteName);

  return {
    metadataBase: metadataBase(),
    title: formatted,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title: formatted,
      description,
      url: absoluteUrl(locale, path),
      siteName: site.settings.siteName,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: formatted,
      description,
    },
  };
}
