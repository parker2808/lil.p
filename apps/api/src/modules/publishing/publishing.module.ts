import { Global, Module } from '@nestjs/common';

import { PostsModule } from '../posts/posts.module';
import { ProjectsModule } from '../projects/projects.module';
import { AdminPreviewController } from './admin-preview.controller';
import { PublishingService } from './publishing.service';

@Global()
@Module({
  imports: [ProjectsModule, PostsModule],
  controllers: [AdminPreviewController],
  providers: [PublishingService],
  exports: [PublishingService],
})
export class PublishingModule {}
