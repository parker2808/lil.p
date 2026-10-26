import 'server-only';

import { type Locale, publicTagSchema, type PublicTag } from '@portfolio/contracts';
import { z } from 'zod';

import { apiServer } from '@/modules/core/services/api-server.service';

export async function listTags(locale: Locale): Promise<PublicTag[]> {
  return apiServer('/api/public/tags', {
    locale,
    tags: ['tags'],
    schema: z.array(publicTagSchema),
  });
}
