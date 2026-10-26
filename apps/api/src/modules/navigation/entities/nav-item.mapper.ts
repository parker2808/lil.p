import type { Locale, PublicNavItem } from '@portfolio/contracts';

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
