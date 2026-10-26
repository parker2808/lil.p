import { Module } from '@nestjs/common';

import { DomainsService } from './domains.service';
import { PublicDomainsController } from './public-domains.controller';

@Module({
  controllers: [PublicDomainsController],
  providers: [DomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
