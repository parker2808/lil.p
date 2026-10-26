import { Module } from '@nestjs/common';

import { ProfileStatsService } from './profile-stats.service';

@Module({
  providers: [ProfileStatsService],
  exports: [ProfileStatsService],
})
export class ProfileStatsModule {}
