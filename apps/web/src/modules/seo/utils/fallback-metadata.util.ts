import type { PublicSite } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { metadataBase } from './site-url.util';

export function fallbackMetadata(site?: PublicSite): Metadata {
  return {
    metadataBase: metadataBase(),
    title: site?.settings.siteName || site?.settings.seoTitle || undefined,
    description: site?.settings.seoDescription || undefined,
  };
}
