import type { Locale, PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { buildAlternates } from './alternates.util';
import { absoluteUrl, metadataBase } from './site-url.util';
import { formatTitle } from './title.util';

/** Default site-wide metadata from SiteSettings (last fallback for every page). */
export function siteMetadata(site: PublicSite, locale: Locale): Metadata {
  const formatted = formatTitle(site.settings.seoTitle, site.settings.siteName);
  return {
    metadataBase: metadataBase(),
    title: formatted,
    description: site.settings.seoDescription,
    alternates: buildAlternates(locale, '/'),
    openGraph: {
      title: formatted,
      description: site.settings.seoDescription,
      url: absoluteUrl(locale, '/'),
      siteName: site.settings.siteName,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'website',
    },
  };
}
