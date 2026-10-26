import { Module } from '@nestjs/common';

import { EducationService } from './education.service';
import { PublicEducationController } from './public-education.controller';

@Module({
  controllers: [PublicEducationController],
  providers: [EducationService],
  exports: [EducationService],
})
export class EducationModule {}
