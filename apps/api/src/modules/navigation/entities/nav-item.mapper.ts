import type { AdminNavItem, Locale, PublicNavItem } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { NavItemRow } from './nav-item.entity';

export function toPublicNavItem(row: NavItemRow, locale: Locale): PublicNavItem {
  const { values, lang } = pickGroup(row, ['label'] as const, locale);
  return {
    id: row.id,
    location: row.location,
    label: values.label ?? '',
    href: row.href,
    lang,
  };
}

export function toAdminDto(row: NavItemRow): AdminNavItem {
  return {
    id: row.id,
    location: row.location,
    labelEn: row.labelEn,
    labelVi: row.labelVi,
    href: row.href,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}
