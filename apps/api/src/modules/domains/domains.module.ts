import { Module } from '@nestjs/common';

import { AdminDomainsController } from './admin-domains.controller';
import { DomainsService } from './domains.service';
import { PublicDomainsController } from './public-domains.controller';

@Module({
  controllers: [PublicDomainsController, AdminDomainsController],
  providers: [DomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
