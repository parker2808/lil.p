import type { PublicExperience } from '@portfolio/contracts';

export const MAX_ACHIEVEMENTS = 2;

export type ExperienceGroup = {
  company: string;
  companyUrl: string | null;
  location: string;
  items: PublicExperience[];
};

/** Group adjacent roles at the same company; a return to an earlier employer starts a new entry. */
export function groupExperience(items: PublicExperience[]): ExperienceGroup[] {
  const groups: ExperienceGroup[] = [];
  for (const item of items) {
    const previous = groups.at(-1);
    if (previous && previous.company === item.company) {
      previous.items.push(item);
      continue;
    }
    groups.push({
      company: item.company,
      companyUrl: item.companyUrl,
      location: item.location,
      items: [item],
    });
  }
  return groups;
}

export function highlightItems(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean);
}

export function achievementItems(value: string): string[] {
  return highlightItems(value).slice(0, MAX_ACHIEVEMENTS);
}
