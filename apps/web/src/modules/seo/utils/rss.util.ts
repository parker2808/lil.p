import type { Locale } from '@portfolio/contracts';

import { localePath } from './site-url.util';

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderRss(input: {
  title: string;
  siteUrl: string;
  feedUrl: string;
  description: string;
  locale: Locale;
  posts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string | null;
  }>;
}): string {
  const items = input.posts
    .map((post) => {
      const link = `${input.siteUrl}${localePath(input.locale, `/notes/${post.slug}`)}`;
      const published = post.publishedAt
        ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`
        : '';
      return [
        '<item>',
        `<title>${xmlEscape(post.title)}</title>`,
        `<link>${xmlEscape(link)}</link>`,
        `<guid>${xmlEscape(link)}</guid>`,
        `<description>${xmlEscape(post.excerpt)}</description>`,
        published,
        '</item>',
      ].join('');
    })
    .join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${xmlEscape(input.title)}</title>`,
    `<link>${xmlEscape(input.siteUrl)}</link>`,
    `<description>${xmlEscape(input.description)}</description>`,
    `<language>${input.locale}</language>`,
    `<atom:link href="${xmlEscape(input.feedUrl)}" rel="self" type="application/rss+xml"/>`,
    items,
    '</channel>',
    '</rss>',
  ].join('');
}
