import type { Locale } from '@portfolio/contracts';
import { ImageResponse } from 'next/og';

import { localeSlugStaticParams } from '@/modules/core/utils/static-params.util';
import { listPublishedPostSlugs } from '@/modules/notes/services/posts.service';
import { OgImage } from '@/modules/seo/components/OgImage/OgImage';
import { loadPostOg } from '@/modules/seo/utils/og-image.util';

export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Image routes do not inherit params from the page segments.
export function generateStaticParams() {
  return localeSlugStaticParams(listPublishedPostSlugs);
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { title, domain } = await loadPostOg(locale as Locale, slug);
  return new ImageResponse(<OgImage title={title} domain={domain} />, size);
}
