import { Module } from '@nestjs/common';

import { AdminEducationController } from './admin-education.controller';
import { EducationService } from './education.service';
import { PublicEducationController } from './public-education.controller';

@Module({
  controllers: [PublicEducationController, AdminEducationController],
  providers: [EducationService],
  exports: [EducationService],
})
export class EducationModule {}
