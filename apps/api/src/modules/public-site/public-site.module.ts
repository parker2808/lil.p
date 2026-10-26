import { Module } from '@nestjs/common';

import { NavigationModule } from '../navigation/navigation.module';
import { ProfileModule } from '../profile/profile.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { SocialLinksModule } from '../social-links/social-links.module';
import { PublicSiteController } from './public-site.controller';
import { PublicSiteService } from './public-site.service';

@Module({
  imports: [SiteSettingsModule, ProfileModule, NavigationModule, SocialLinksModule],
  controllers: [PublicSiteController],
  providers: [PublicSiteService],
})
export class PublicSiteModule {}
