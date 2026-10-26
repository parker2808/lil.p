import 'server-only';

import { type Locale, publicSiteSchema, type PublicSite } from '@portfolio/contracts';
import { cache } from 'react';

import { apiServer } from './api-server.service';

export const getSite = cache(async (locale: Locale): Promise<PublicSite> => {
  return apiServer('/api/public/site', {
    locale,
    tags: ['site'],
    schema: publicSiteSchema,
  });
});
