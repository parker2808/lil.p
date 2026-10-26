import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { OriginGuard } from './common/guards/origin.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContactTopicsModule } from './modules/contact-topics/contact-topics.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DomainsModule } from './modules/domains/domains.module';
import { EducationModule } from './modules/education/education.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { HealthModule } from './modules/health/health.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { PagesModule } from './modules/pages/pages.module';
import { PostsModule } from './modules/posts/posts.module';
import { PrinciplesModule } from './modules/principles/principles.module';
import { ProcessStepsModule } from './modules/process-steps/process-steps.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProfileStatsModule } from './modules/profile-stats/profile-stats.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PublicSiteModule } from './modules/public-site/public-site.module';
import { SiteSettingsModule } from './modules/site-settings/site-settings.module';
import { SkillsModule } from './modules/skills/skills.module';
import { SocialLinksModule } from './modules/social-links/social-links.module';
import { TagsModule } from './modules/tags/tags.module';
import { UsersModule } from './modules/users/users.module';
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
    DomainsModule,
    ProjectsModule,
    SkillsModule,
    PostsModule,
    TagsModule,
    ContactTopicsModule,
    PublicSiteModule,
    PagesModule,
    UsersModule,
    AuthModule,
    DashboardModule,
    ThrottlerModule.forRoot({
      skipIf: () => process.env.NODE_ENV === 'test' && process.env.E2E_THROTTLE !== '1',
      throttlers: [{ name: 'default', ttl: 60_000, limit: 10_000 }],
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: OriginGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
