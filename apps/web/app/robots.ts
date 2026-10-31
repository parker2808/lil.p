import type { MetadataRoute } from 'next';

import { siteUrl } from '@/modules/seo/utils/site-url.util';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
