import { Module } from '@nestjs/common';

import { AdminSiteController } from './admin-site.controller';
import { SiteSettingsService } from './site-settings.service';

@Module({
  controllers: [AdminSiteController],
  providers: [SiteSettingsService],
  exports: [SiteSettingsService],
})
export class SiteSettingsModule {}
