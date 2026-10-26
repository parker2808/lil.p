import { Controller, Get } from '@nestjs/common';
import type { PublicPrinciple } from '@portfolio/contracts';

import { Locale } from '../../i18n/locale.decorator';
import { PrinciplesService } from './principles.service';

@Controller('public/principles')
export class PublicPrinciplesController {
  constructor(private readonly principles: PrinciplesService) {}

  @Get()
  list(@Locale() locale: 'en' | 'vi'): Promise<PublicPrinciple[]> {
    return this.principles.listPublic(locale);
  }
}
