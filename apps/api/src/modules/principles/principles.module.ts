import { Module } from '@nestjs/common';

import { AdminPrinciplesController } from './admin-principles.controller';
import { PrinciplesService } from './principles.service';
import { PublicPrinciplesController } from './public-principles.controller';

@Module({
  controllers: [PublicPrinciplesController, AdminPrinciplesController],
  providers: [PrinciplesService],
  exports: [PrinciplesService],
})
export class PrinciplesModule {}
