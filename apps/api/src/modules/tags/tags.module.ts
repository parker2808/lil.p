import { Module } from '@nestjs/common';

import { AdminTagsController } from './admin-tags.controller';
import { PublicTagsController } from './public-tags.controller';
import { TagsService } from './tags.service';

@Module({
  controllers: [PublicTagsController, AdminTagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
