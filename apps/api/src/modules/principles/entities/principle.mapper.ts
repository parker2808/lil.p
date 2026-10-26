import type { AdminPrinciple, IconKey, Locale, PublicPrinciple } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { PrincipleRow } from './principle.entity';

const TRANSLATED = ['title', 'body'] as const;

export function toPublicPrinciple(row: PrincipleRow, locale: Locale): PublicPrinciple {
  const { values, lang } = pickGroup(row, TRANSLATED, locale);

  return {
    id: row.id,
    title: values.title ?? '',
    body: values.body ?? '',
    iconKey: row.iconKey as IconKey,
    lang,
  };
}

export function toAdminDto(row: PrincipleRow): AdminPrinciple {
  return {
    id: row.id,
    titleEn: row.titleEn,
    titleVi: row.titleVi,
    bodyEn: row.bodyEn,
    bodyVi: row.bodyVi,
    iconKey: row.iconKey as IconKey,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}
