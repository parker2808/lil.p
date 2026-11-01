import 'server-only';

import { type Locale, publicExperienceSchema, type PublicExperience } from '@portfolio/contracts';
import { z } from 'zod';

import { apiServer } from '@/modules/core/services/api-server.service';
import { guardExperience } from '../utils/content-guard.util';

export async function listExperience(locale: Locale): Promise<PublicExperience[]> {
  const items = await apiServer('/api/public/experience', {
    locale,
    tags: ['experience'],
    schema: z.array(publicExperienceSchema),
  });
  return guardExperience(items);
}
