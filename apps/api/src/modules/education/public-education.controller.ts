import { Controller, Get } from '@nestjs/common';
import type { PublicEducation } from '@portfolio/contracts';

import { Locale } from '../../i18n/locale.decorator';
import { EducationService } from './education.service';

@Controller('public/education')
export class PublicEducationController {
  constructor(private readonly education: EducationService) {}

  @Get()
  list(@Locale() locale: 'en' | 'vi'): Promise<PublicEducation[]> {
    return this.education.listPublic(locale);
  }
}
