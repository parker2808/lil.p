import { Controller, Get } from '@nestjs/common';
import type { PublicSite } from '@portfolio/contracts';

import { Locale } from '../../i18n/locale.decorator';
import { PublicSiteService } from './public-site.service';

@Controller('public/site')
export class PublicSiteController {
  constructor(private readonly publicSite: PublicSiteService) {}

  @Get()
  getSite(@Locale() locale: 'en' | 'vi'): Promise<PublicSite> {
    return this.publicSite.getSite(locale);
  }
}
