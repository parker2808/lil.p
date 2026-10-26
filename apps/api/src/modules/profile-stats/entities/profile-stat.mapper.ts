import type { AdminProfileStat, IconKey, Locale, PublicProfileStat } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { ProfileStatRow } from './profile-stat.entity';

export function toPublicProfileStat(
  row: ProfileStatRow,
  locale: Locale,
  value: string,
): PublicProfileStat {
  const { values, lang } = pickGroup(row, ['label'] as const, locale);

  return {
    id: row.id,
    label: values.label ?? '',
    value,
    suffix: row.suffix,
    source: row.source,
    iconKey: row.iconKey as IconKey,
    lang,
  };
}

export function toAdminDto(row: ProfileStatRow): AdminProfileStat {
  return {
    id: row.id,
    labelEn: row.labelEn,
    labelVi: row.labelVi,
    value: row.value,
    suffix: row.suffix,
    source: row.source,
    iconKey: row.iconKey as IconKey,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}
