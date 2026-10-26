import type { Locale } from '@portfolio/contracts';
import { ImageResponse } from 'next/og';

import { OgImage } from '@/modules/seo/components/OgImage/OgImage';
import { loadHomeOg } from '@/modules/seo/utils/og-image.util';

export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { title, domain } = await loadHomeOg(locale as Locale);
  return new ImageResponse(<OgImage title={title} domain={domain} />, size);
}
