import { Module } from '@nestjs/common';

import { AdminSkillCategoriesController, AdminSkillsController } from './admin-skills.controller';
import { PublicSkillsController } from './public-skills.controller';
import { SkillsService } from './skills.service';

@Module({
  controllers: [PublicSkillsController, AdminSkillsController, AdminSkillCategoriesController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
