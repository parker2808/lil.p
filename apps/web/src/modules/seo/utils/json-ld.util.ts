import type {
  Locale,
  PublicPostDetail,
  PublicProjectDetail,
  PublicSite,
} from '@portfolio/contracts';

import { absoluteUrl, siteUrl } from './site-url.util';

export function escapeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function personJsonLd(site: PublicSite): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.profile.displayName,
    jobTitle: site.profile.headline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.profile.city,
      addressCountry: site.profile.country,
    },
    url: siteUrl(),
  };
}

export function creativeWorkJsonLd(
  project: PublicProjectDetail,
  locale: Locale,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.tagline,
    url: absoluteUrl(locale, `/projects/${project.slug}`),
  };
}

export function blogPostingJsonLd(post: PublicPostDetail, locale: Locale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt ?? undefined,
    url: absoluteUrl(locale, `/notes/${post.slug}`),
  };
}

export function breadcrumbListJsonLd(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export const crumbLabel = {
  en: { home: 'Home', projects: 'Projects', notes: 'Notes' },
  vi: { home: 'Trang chủ', projects: 'Dự án', notes: 'Ghi chú' },
} as const;
