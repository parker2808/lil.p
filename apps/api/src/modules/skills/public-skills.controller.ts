import { Controller, Get, Query } from '@nestjs/common';
import {
  type PublicSkill,
  type PublicSkillsGrouped,
  publicSkillsQuerySchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Locale } from '../../i18n/locale.decorator';
import { SkillsService } from './skills.service';

@Controller('public/skills')
export class PublicSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  list(
    @Locale() locale: 'en' | 'vi',
    @Query(new ZodValidationPipe(publicSkillsQuerySchema)) query: { marquee?: string },
  ): Promise<PublicSkill[] | PublicSkillsGrouped> {
    const marquee = query.marquee === '1' || query.marquee === 'true';
    return this.skills.listPublic(locale, marquee);
  }
}
