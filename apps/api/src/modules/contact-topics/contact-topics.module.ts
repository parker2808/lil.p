import { Module } from '@nestjs/common';

import { AdminContactTopicsController } from './admin-contact-topics.controller';
import { ContactTopicsService } from './contact-topics.service';
import { PublicContactTopicsController } from './public-contact-topics.controller';

@Module({
  controllers: [PublicContactTopicsController, AdminContactTopicsController],
  providers: [ContactTopicsService],
  exports: [ContactTopicsService],
})
export class ContactTopicsModule {}
