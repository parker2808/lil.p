import type { z } from 'zod';

import type {
  adminContactMessageListPageSchema,
  adminContactMessageListParamsSchema,
  adminContactMessageSchema,
  adminContactMessageTopicSchema,
  contactMessageStatusSchema,
  contactSchema,
  contactSubmitResultSchema,
  unreadCountSchema,
  updateContactMessageSchema,
} from './contact.schema';

export type ContactMessageStatus = z.infer<typeof contactMessageStatusSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ContactSubmitResult = z.infer<typeof contactSubmitResultSchema>;
export type AdminContactMessageTopic = z.infer<typeof adminContactMessageTopicSchema>;
export type AdminContactMessage = z.infer<typeof adminContactMessageSchema>;
export type AdminContactMessageListParams = z.infer<typeof adminContactMessageListParamsSchema>;
export type AdminContactMessageListPage = z.infer<typeof adminContactMessageListPageSchema>;
export type UpdateContactMessageInput = z.infer<typeof updateContactMessageSchema>;
export type UnreadCount = z.infer<typeof unreadCountSchema>;
