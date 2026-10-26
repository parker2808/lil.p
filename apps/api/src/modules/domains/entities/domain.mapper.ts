import type { AdminDomain, IconKey, Locale, PublicDomain } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { DomainRow } from './domain.entity';

const TRANSLATED = ['name', 'description'] as const;

export function toPublicDomain(row: DomainRow, locale: Locale): PublicDomain {
  const { values, lang } = pickGroup(row, TRANSLATED, locale);
  return {
    id: row.id,
    slug: row.slug,
    name: values.name ?? '',
    description: values.description ?? '',
    hue: row.hue,
    iconKey: row.iconKey as IconKey,
    projectCount: row._count.projects,
    lang,
  };
}

export function toAdminDto(row: DomainRow): AdminDomain {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameVi: row.nameVi,
    descriptionEn: row.descriptionEn,
    descriptionVi: row.descriptionVi,
    hue: row.hue,
    iconKey: row.iconKey as IconKey,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}
