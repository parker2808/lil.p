import 'server-only';

import { type Locale, publicPrincipleSchema, type PublicPrinciple } from '@portfolio/contracts';
import { z } from 'zod';

import { apiServer } from '@/modules/core/services/api-server.service';

export async function listPrinciples(locale: Locale): Promise<PublicPrinciple[]> {
  return apiServer('/api/public/principles', {
    locale,
    tags: ['principles'],
    schema: z.array(publicPrincipleSchema),
  });
}
