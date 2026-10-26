import type { IconKey, Locale, PublicProfileStat } from '@portfolio/contracts';

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
