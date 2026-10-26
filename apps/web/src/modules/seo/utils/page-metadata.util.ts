import { type Locale, type PublicPage, type PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { buildAlternates } from './alternates.util';
import { firstH1 } from './first-h1.util';
import { absoluteUrl, metadataBase } from './site-url.util';
import { firstText, formatTitle } from './title.util';

export function pageMetadata({
  site,
  page,
  locale,
  path,
}: {
  site: PublicSite;
  page: PublicPage;
  locale: Locale;
  path: string;
}): Metadata {
  const h1 = firstH1(page.blocks);
  const title =
    firstText(page.seo.title, h1.title, site.settings.seoTitle) ?? site.settings.siteName;
  const description = firstText(page.seo.description, h1.intro, site.settings.seoDescription);
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
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: formatted,
      description,
    },
  };
}
