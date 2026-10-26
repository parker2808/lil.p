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

export async function listMarqueeSkills(locale: Locale): Promise<PublicSkill[]> {
  return apiServer('/api/public/skills?marquee=1', {
    locale,
    tags: ['skills'],
    schema: z.array(publicSkillSchema),
  });
}

export async function listSkillsGrouped(locale: Locale): Promise<PublicSkillsGrouped> {
  return apiServer('/api/public/skills', {
    locale,
    tags: ['skills'],
    schema: publicSkillsGroupedSchema,
  });
}
