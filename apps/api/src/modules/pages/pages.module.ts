import { Module } from '@nestjs/common';

import { AdminPagesController } from './admin-pages.controller';
import { BuilderDraftService } from './builder-draft.service';
import { PageVersionsService } from './page-versions.service';
import { PagesService } from './pages.service';
import { PublicPagesController } from './public-pages.controller';

@Module({
  controllers: [PublicPagesController, AdminPagesController],
  providers: [PagesService, PageVersionsService, BuilderDraftService],
  exports: [PagesService, PageVersionsService],
})
export class PagesModule {}
