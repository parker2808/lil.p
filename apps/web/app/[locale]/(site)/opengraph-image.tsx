import type { Locale } from '@portfolio/contracts';
import { ImageResponse } from 'next/og';

import { localeStaticParams } from '@/modules/core/utils/static-params.util';
import { OgImage } from '@/modules/seo/components/OgImage/OgImage';
import { loadHomeOg } from '@/modules/seo/utils/og-image.util';

export const revalidate = 3600;
// Image routes do not inherit the locale layout's params.
export const generateStaticParams = localeStaticParams;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { title, domain } = await loadHomeOg(locale as Locale);
  return new ImageResponse(<OgImage title={title} domain={domain} />, size);
}
