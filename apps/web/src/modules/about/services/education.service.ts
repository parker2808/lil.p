import 'server-only';

import { type Locale, publicEducationSchema, type PublicEducation } from '@portfolio/contracts';
import { z } from 'zod';

import { apiServer } from '@/modules/core/services/api-server.service';

export async function listEducation(locale: Locale): Promise<PublicEducation[]> {
  return apiServer('/api/public/education', {
    locale,
    tags: ['education'],
    schema: z.array(publicEducationSchema),
  });
}
