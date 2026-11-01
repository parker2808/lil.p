import type { PublicExperience, PublicSkill, PublicSkillsGrouped } from '@portfolio/contracts';

import { isPlaceholderText } from '@/modules/core/utils/placeholder.util';

/** Keep an experience entry while hiding unfinished editorial fields. */
export function guardExperience(items: PublicExperience[]): PublicExperience[] {
  return items.map((item) => ({
    ...item,
    company: isPlaceholderText(item.company) ? '' : item.company,
    location: isPlaceholderText(item.location) ? '' : item.location,
    role: isPlaceholderText(item.role) ? '' : item.role,
    summary: isPlaceholderText(item.summary) ? '' : item.summary,
    highlights: isPlaceholderText(item.highlights) ? '' : item.highlights,
  }));
}

export function guardSkills(items: PublicSkill[]): PublicSkill[] {
  return items
    .filter((item) => !isPlaceholderText(item.name))
    .map((item) => ({
      ...item,
      category: {
        ...item.category,
        name: isPlaceholderText(item.category.name) ? '' : item.category.name,
      },
    }));
}

export function guardSkillGroups(groups: PublicSkillsGrouped): PublicSkillsGrouped {
  return {
    daily: guardSkills(groups.daily),
    shipped: guardSkills(groups.shipped),
    growing: guardSkills(groups.growing),
  };
}
