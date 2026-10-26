import type { AdminContactTopic, Locale, PublicContactTopic } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { ContactTopicRow } from './contact-topic.entity';

export function toPublicContactTopic(row: ContactTopicRow, locale: Locale): PublicContactTopic {
  const { values, lang } = pickGroup(row, ['label'] as const, locale);
  return {
    id: row.id,
    slug: row.slug,
    label: values.label ?? '',
    lang,
  };
}

export function toAdminDto(row: ContactTopicRow): AdminContactTopic {
  return {
    id: row.id,
    slug: row.slug,
    labelEn: row.labelEn,
    labelVi: row.labelVi,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}
