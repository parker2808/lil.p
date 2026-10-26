import { Module } from '@nestjs/common';

import { PublicTagsController } from './public-tags.controller';
import { TagsService } from './tags.service';

@Module({
  controllers: [PublicTagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
