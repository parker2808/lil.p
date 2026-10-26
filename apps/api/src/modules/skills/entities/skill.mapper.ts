import type { AdminSkill, AdminSkillCategory, Locale, PublicSkill } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { SkillCategoryRow, SkillRow } from './skill.entity';

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

export function toAdminSkill(row: SkillRow): AdminSkill {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.categoryId,
    depth: row.depth,
    showInMarquee: row.showInMarquee,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toAdminCategory(row: SkillCategoryRow): AdminSkillCategory {
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameVi: row.nameVi,
    sortOrder: row.sortOrder,
    skillCount: row._count.skills,
    updatedAt: row.updatedAt.toISOString(),
  };
}
