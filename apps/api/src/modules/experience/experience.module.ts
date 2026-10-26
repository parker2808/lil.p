import { Module } from '@nestjs/common';

import { ExperienceService } from './experience.service';
import { PublicExperienceController } from './public-experience.controller';

@Module({
  controllers: [PublicExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
