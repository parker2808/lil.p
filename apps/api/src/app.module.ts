import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ConfigModule } from './config/config.module';
import { EducationModule } from './modules/education/education.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { HealthModule } from './modules/health/health.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { PagesModule } from './modules/pages/pages.module';
import { PrinciplesModule } from './modules/principles/principles.module';
import { ProcessStepsModule } from './modules/process-steps/process-steps.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProfileStatsModule } from './modules/profile-stats/profile-stats.module';
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
    ExperienceModule,
    EducationModule,
    PrinciplesModule,
    ProcessStepsModule,
    ProfileStatsModule,
    PublicSiteModule,
    PagesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
