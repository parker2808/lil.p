import 'server-only';

import {
  type Locale,
  type PublicContactTopic,
  publicContactTopicSchema,
} from '@portfolio/contracts';
import { z } from 'zod';

import { apiServer } from '@/modules/core/services/api-server.service';

export function listContactTopics(locale: Locale): Promise<PublicContactTopic[]> {
  return apiServer('/api/public/contact-topics', {
    locale,
    tags: ['contact-topics'],
    schema: z.array(publicContactTopicSchema),
  });
}
