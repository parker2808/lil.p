import { Module } from '@nestjs/common';

import { AdminSocialLinksController } from './admin-social-links.controller';
import { SocialLinksService } from './social-links.service';

@Module({
  controllers: [AdminSocialLinksController],
  providers: [SocialLinksService],
  exports: [SocialLinksService],
})
export class SocialLinksModule {}
