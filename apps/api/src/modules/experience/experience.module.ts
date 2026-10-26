import { Module } from '@nestjs/common';

import { AdminExperienceController } from './admin-experience.controller';
import { ExperienceService } from './experience.service';
import { PublicExperienceController } from './public-experience.controller';

@Module({
  controllers: [PublicExperienceController, AdminExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
