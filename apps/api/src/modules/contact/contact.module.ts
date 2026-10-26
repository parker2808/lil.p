import { Module } from '@nestjs/common';

import { AdminContactController } from './admin-contact.controller';
import { ContactService } from './contact.service';
import { PublicContactController } from './public-contact.controller';

@Module({
  controllers: [PublicContactController, AdminContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
