import type { Locale, PublicPostDetail, PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { buildAlternates } from './alternates.util';
import { absoluteUrl, metadataBase } from './site-url.util';
import { firstText, formatTitle } from './title.util';

export function postMetadata({
  site,
  post,
  locale,
}: {
  site: PublicSite;
  post: PublicPostDetail;
  locale: Locale;
}): Metadata {
  const path = `/notes/${post.slug}`;
  const title = firstText(post.seoTitle, post.title) ?? site.settings.siteName;
  const description = firstText(post.seoDescription, post.excerpt, site.settings.seoDescription);
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
