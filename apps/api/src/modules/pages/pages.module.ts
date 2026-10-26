import { Module } from '@nestjs/common';

import { PagesService } from './pages.service';
import { PublicPagesController } from './public-pages.controller';

@Module({
  controllers: [PublicPagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
