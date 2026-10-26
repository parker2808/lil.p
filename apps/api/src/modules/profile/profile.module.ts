import { Module } from '@nestjs/common';

import { AdminProfileController } from './admin-profile.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [AdminProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
