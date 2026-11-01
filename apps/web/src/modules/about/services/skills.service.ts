import 'server-only';

import {
  type Locale,
  publicSkillSchema,
  publicSkillsGroupedSchema,
  type PublicSkill,
  type PublicSkillsGrouped,
} from '@portfolio/contracts';
import { z } from 'zod';

import { apiServer } from '@/modules/core/services/api-server.service';
import { guardSkillGroups, guardSkills } from '../utils/content-guard.util';

export async function listMarqueeSkills(locale: Locale): Promise<PublicSkill[]> {
  const items = await apiServer('/api/public/skills?marquee=1', {
    locale,
    tags: ['skills'],
    schema: z.array(publicSkillSchema),
  });
  return guardSkills(items);
}

export async function listSkillsGrouped(locale: Locale): Promise<PublicSkillsGrouped> {
  const groups = await apiServer('/api/public/skills', {
    locale,
    tags: ['skills'],
    schema: publicSkillsGroupedSchema,
  });
  return guardSkillGroups(groups);
}
