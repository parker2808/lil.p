import 'server-only';

import { type Locale, publicProcessStepSchema, type PublicProcessStep } from '@portfolio/contracts';
import { z } from 'zod';

import { apiServer } from '@/modules/core/services/api-server.service';

export async function listProcessSteps(locale: Locale): Promise<PublicProcessStep[]> {
  return apiServer('/api/public/process-steps', {
    locale,
    tags: ['process-steps'],
    schema: z.array(publicProcessStepSchema),
  });
}
