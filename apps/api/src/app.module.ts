import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { HealthModule } from './modules/health/health.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PublicSiteModule } from './modules/public-site/public-site.module';
import { SiteSettingsModule } from './modules/site-settings/site-settings.module';
import { SocialLinksModule } from './modules/social-links/social-links.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    HealthModule,
    SiteSettingsModule,
    ProfileModule,
    NavigationModule,
    SocialLinksModule,
    PublicSiteModule,
  ],
})
export class AppModule {}
