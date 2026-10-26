import { Controller, Get } from '@nestjs/common';
import type { PublicDomain } from '@portfolio/contracts';

import { Public } from '../../common/decorators/public.decorator';
import { Locale } from '../../i18n/locale.decorator';
import { DomainsService } from './domains.service';

@Public()
@Controller('public/domains')
export class PublicDomainsController {
  constructor(private readonly domains: DomainsService) {}

  @Get()
  list(@Locale() locale: 'en' | 'vi'): Promise<PublicDomain[]> {
    return this.domains.listPublic(locale);
  }
}
