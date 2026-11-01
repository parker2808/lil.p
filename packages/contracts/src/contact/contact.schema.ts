import { z } from 'zod';

import { listParamsSchema, paginatedSchema } from '../common/list-params.schema';
import { localeSchema } from '../common/locale.schema';

export const CONTACT_MESSAGE_MAX = 2000;

export const CONTACT_MESSAGE_STATUSES = ['NEW', 'READ', 'REPLIED', 'SPAM', 'ARCHIVED'] as const;

/** Statuses the inbox hides when no status filter is set. */
export const CONTACT_MESSAGE_HIDDEN_STATUSES = ['SPAM', 'ARCHIVED'] as const;

export const contactMessageStatusSchema = z.enum(CONTACT_MESSAGE_STATUSES);

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
  topic: z.string().trim().max(80).optional(),
  message: z.string().trim().min(1).max(CONTACT_MESSAGE_MAX),
  website: z.string().max(200).optional().default(''),
  locale: localeSchema.optional().default('en'),
});

export const contactSubmitResultSchema = z.object({
  ok: z.literal(true),
});

export const adminContactMessageTopicSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  labelEn: z.string(),
  labelVi: z.string(),
});

export const adminContactMessageSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  topicId: z.number().int().nullable(),
  topic: adminContactMessageTopicSchema.nullable(),
  message: z.string(),
  locale: localeSchema,
  status: contactMessageStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const adminContactMessageListParamsSchema = listParamsSchema([
  '-createdAt',
  'createdAt',
]).extend({
  status: contactMessageStatusSchema.optional(),
});

export const adminContactMessageListPageSchema = paginatedSchema(adminContactMessageSchema);

export const updateContactMessageSchema = z.object({
  status: contactMessageStatusSchema,
});

export const unreadCountSchema = z.object({
  unread: z.number().int().nonnegative(),
});
