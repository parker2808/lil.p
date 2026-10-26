import type { PublicExperience } from '@portfolio/contracts';

export type ExperienceGroup = {
  company: string;
  companyUrl: string | null;
  location: string;
  items: PublicExperience[];
};

export function groupExperience(items: PublicExperience[]): ExperienceGroup[] {
  const groups: ExperienceGroup[] = [];
  for (const item of items) {
    const existing = groups.find((group) => group.company === item.company);
    if (existing) {
      existing.items.push(item);
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
