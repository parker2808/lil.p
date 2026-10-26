import { Module } from '@nestjs/common';

import { PublicSkillsController } from './public-skills.controller';
import { SkillsService } from './skills.service';

@Module({
  controllers: [PublicSkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
