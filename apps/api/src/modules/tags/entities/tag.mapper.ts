import type { AdminTag, Locale, PublicTag } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { TagRow } from './tag.entity';

export function toPublicTag(row: TagRow, locale: Locale): PublicTag {
  const { values, lang } = pickGroup(row, ['name'] as const, locale);
  return {
    id: row.id,
    slug: row.slug,
    name: values.name ?? '',
    postCount: row._count.posts,
    lang,
  };
}

export function toAdminDto(row: TagRow): AdminTag {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameVi: row.nameVi,
    updatedAt: row.updatedAt.toISOString(),
  };
}
