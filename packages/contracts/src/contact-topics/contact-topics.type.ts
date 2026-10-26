import type { z } from 'zod';

import type {
  adminContactTopicSchema,
  contactTopicCreateSchema,
  contactTopicUpdateSchema,
  publicContactTopicSchema,
} from './contact-topics.schema';

export type PublicContactTopic = z.infer<typeof publicContactTopicSchema>;
export type ContactTopicCreateInput = z.infer<typeof contactTopicCreateSchema>;
export type ContactTopicUpdateInput = z.infer<typeof contactTopicUpdateSchema>;
export type AdminContactTopic = z.infer<typeof adminContactTopicSchema>;
