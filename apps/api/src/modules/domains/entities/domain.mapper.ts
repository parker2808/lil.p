import type { IconKey, Locale, PublicDomain } from '@portfolio/contracts';

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
