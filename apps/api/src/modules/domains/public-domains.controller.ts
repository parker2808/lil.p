import { Controller, Get } from '@nestjs/common';
import type { PublicDomain } from '@portfolio/contracts';

import { Locale } from '../../i18n/locale.decorator';
import { DomainsService } from './domains.service';

@Controller('public/domains')
export class PublicDomainsController {
  constructor(private readonly domains: DomainsService) {}

  @Get()
  list(@Locale() locale: 'en' | 'vi'): Promise<PublicDomain[]> {
    return this.domains.listPublic(locale);
  }
}
