import { Module } from '@nestjs/common';

import { AdminPostsController } from './admin-posts.controller';
import { PostsService } from './posts.service';
import { PublicPostsController } from './public-posts.controller';

@Module({
  controllers: [PublicPostsController, AdminPostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
