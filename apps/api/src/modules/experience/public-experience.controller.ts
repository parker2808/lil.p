import { Controller, Get } from '@nestjs/common';
import type { PublicExperience } from '@portfolio/contracts';

import { Public } from '../../common/decorators/public.decorator';
import { Locale } from '../../i18n/locale.decorator';
import { ExperienceService } from './experience.service';

@Public()
@Controller('public/experience')
export class PublicExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get()
  list(@Locale() locale: 'en' | 'vi'): Promise<PublicExperience[]> {
    return this.experience.listPublic(locale);
  }
}
