import type { IconKey, Locale, PublicPrinciple } from '@portfolio/contracts';

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
