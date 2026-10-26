import { Module } from '@nestjs/common';

import { AdminProfileStatsController } from './admin-profile-stats.controller';
import { ProfileStatsService } from './profile-stats.service';

@Module({
  controllers: [AdminProfileStatsController],
  providers: [ProfileStatsService],
  exports: [ProfileStatsService],
})
export class ProfileStatsModule {}
