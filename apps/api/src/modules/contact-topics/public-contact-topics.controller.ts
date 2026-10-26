import { Controller, Get } from '@nestjs/common';
import type { PublicContactTopic } from '@portfolio/contracts';

import { Public } from '../../common/decorators/public.decorator';
import { Locale } from '../../i18n/locale.decorator';
import { ContactTopicsService } from './contact-topics.service';

@Public()
@Controller('public/contact-topics')
export class PublicContactTopicsController {
  constructor(private readonly topics: ContactTopicsService) {}

  @Get()
  list(@Locale() locale: 'en' | 'vi'): Promise<PublicContactTopic[]> {
    return this.topics.listPublic(locale);
  }
}
