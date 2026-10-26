import { Module } from '@nestjs/common';

import { PrinciplesService } from './principles.service';
import { PublicPrinciplesController } from './public-principles.controller';

@Module({
  controllers: [PublicPrinciplesController],
  providers: [PrinciplesService],
  exports: [PrinciplesService],
})
export class PrinciplesModule {}
