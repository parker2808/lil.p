import type { Locale } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { getSite } from '@/modules/core/services/site.service';
import { getPostOrNull } from '@/modules/notes/services/posts.service';

import { fallbackMetadata } from './fallback-metadata.util';
import { postMetadata } from './post-metadata.util';

export async function buildPostMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const typed = locale as Locale;
    const [site, post] = await Promise.all([getSite(typed), getPostOrNull(slug, typed)]);
    if (!post) {
      return fallbackMetadata(site);
    }
    return postMetadata({ site, post, locale: typed });
  } catch {
    return fallbackMetadata();
  }
}
