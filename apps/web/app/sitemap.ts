import type { MetadataRoute } from 'next';

import { getSitemap } from '@/modules/seo/services/sitemap.service';
import { absoluteUrl } from '@/modules/seo/utils/site-url.util';

// CI `next build` has no Nest process.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const data = await getSitemap();
    return data.entries.flatMap((entry) => {
      const en = absoluteUrl('en', entry.path);
      const vi = absoluteUrl('vi', entry.path);
      return [
        {
          url: en,
          lastModified: entry.updatedAt,
          alternates: { languages: { en, vi } },
        },
        {
          url: vi,
          lastModified: entry.updatedAt,
          alternates: { languages: { en, vi } },
        },
      ];
    });
  } catch {
    return [];
  }
}
