import type { Locale, PublicSkill } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { SkillRow } from './skill.entity';

export function toPublicSkill(row: SkillRow, locale: Locale): PublicSkill {
  const { values, lang } = pickGroup(row.category, ['name'] as const, locale);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    depth: row.depth,
    showInMarquee: row.showInMarquee,
    category: {
      id: row.category.id,
      name: values.name ?? '',
      lang,
    },
    lang,
  };
}
