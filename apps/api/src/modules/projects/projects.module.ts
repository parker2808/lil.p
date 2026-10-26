import { Module } from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { PublicProjectsController } from './public-projects.controller';

@Module({
  controllers: [PublicProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
