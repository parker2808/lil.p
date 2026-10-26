import 'server-only';

import { type Locale, publicDomainSchema, type PublicDomain } from '@portfolio/contracts';
import { z } from 'zod';

import { apiServer } from '@/modules/core/services/api-server.service';

export async function listDomains(locale: Locale): Promise<PublicDomain[]> {
  return apiServer('/api/public/domains', {
    locale,
    tags: ['domains'],
    schema: z.array(publicDomainSchema),
  });
}
