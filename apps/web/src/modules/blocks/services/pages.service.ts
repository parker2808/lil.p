import 'server-only';

import { type Locale, type PageKey, publicPageSchema, type PublicPage } from '@portfolio/contracts';
import { cache } from 'react';

import { apiServer } from '@/modules/core/services/api-server.service';

export const getPage = cache(async (key: PageKey, locale: Locale): Promise<PublicPage> => {
  return apiServer(`/api/public/pages/${key}`, {
    locale,
    tags: [`page:${key}`],
    schema: publicPageSchema,
  });
});
