import { Controller, Get } from '@nestjs/common';
import type { PublicSite, PublicSitemap } from '@portfolio/contracts';

import { Public } from '../../common/decorators/public.decorator';
import { Locale } from '../../i18n/locale.decorator';
import { PublicSiteService } from './public-site.service';

@Public()
@Controller('public/site')
export class PublicSiteController {
  constructor(private readonly publicSite: PublicSiteService) {}

  @Get()
  getSite(@Locale() locale: 'en' | 'vi'): Promise<PublicSite> {
    return this.publicSite.getSite(locale);
  }
}

@Public()
@Controller('public/sitemap')
export class PublicSitemapController {
  constructor(private readonly publicSite: PublicSiteService) {}

  @Get()
  getSitemap(): Promise<PublicSitemap> {
    return this.publicSite.getSitemap();
  }
}
