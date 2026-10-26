import 'server-only';

import { type Locale, type PublicSkillChip, publicSkillsGroupedSchema } from '@portfolio/contracts';

import { apiServer } from '@/modules/core/services/api-server.service';

export async function listSkillOptions(locale: Locale): Promise<PublicSkillChip[]> {
  const grouped = await apiServer('/api/public/skills', {
    locale,
    tags: ['skills'],
    schema: publicSkillsGroupedSchema,
  });
  return [...grouped.daily, ...grouped.shipped, ...grouped.growing].map((skill) => ({
    name: skill.name,
    slug: skill.slug,
  }));
}
