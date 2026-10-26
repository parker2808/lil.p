import 'server-only';

import { publicSitemapSchema, type PublicSitemap } from '@portfolio/contracts';

import { apiServer } from '@/modules/core/services/api-server.service';

export async function getSitemap(): Promise<PublicSitemap> {
  return apiServer('/api/public/sitemap', {
    tags: ['site', 'projects', 'posts'],
    schema: publicSitemapSchema,
  });
}
