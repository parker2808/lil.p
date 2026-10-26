import type { AdminContactMessage, Locale } from '@portfolio/contracts';
import { localeSchema } from '@portfolio/contracts';

import type { ContactMessageRow } from './contact-message.entity';

export function toAdminContactMessage(row: ContactMessageRow): AdminContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    topicId: row.topicId,
    topic: row.topic,
    message: row.message,
    locale: parseLocale(row.locale),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function parseLocale(value: string): Locale {
  const parsed = localeSchema.safeParse(value);
  return parsed.success ? parsed.data : 'en';
}
