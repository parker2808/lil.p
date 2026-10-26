import { Module } from '@nestjs/common';

import { AnalyticsService } from './analytics.service';
import { PublicViewsController } from './public-views.controller';

@Module({
  controllers: [PublicViewsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
