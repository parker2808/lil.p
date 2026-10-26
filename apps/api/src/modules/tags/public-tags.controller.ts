import { Controller, Get } from '@nestjs/common';
import type { PublicTag } from '@portfolio/contracts';

import { Locale } from '../../i18n/locale.decorator';
import { TagsService } from './tags.service';

@Controller('public/tags')
export class PublicTagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  list(@Locale() locale: 'en' | 'vi'): Promise<PublicTag[]> {
    return this.tags.listPublic(locale);
  }
}
