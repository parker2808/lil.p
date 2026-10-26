import type { Locale } from '@portfolio/contracts';
import { ImageResponse } from 'next/og';

import { OgImage } from '@/modules/seo/components/OgImage/OgImage';
import { loadProjectOg } from '@/modules/seo/utils/og-image.util';

export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { title, domain, versionFrom, versionTo } = await loadProjectOg(locale as Locale, slug);
  return new ImageResponse(
    <OgImage title={title} domain={domain} versionFrom={versionFrom} versionTo={versionTo} />,
    size,
  );
}
