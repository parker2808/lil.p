import { Module } from '@nestjs/common';

import { AdminProjectsController } from './admin-projects.controller';
import { ProjectsService } from './projects.service';
import { PublicProjectsController } from './public-projects.controller';

@Module({
  controllers: [PublicProjectsController, AdminProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
