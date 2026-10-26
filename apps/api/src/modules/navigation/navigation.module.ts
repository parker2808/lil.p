import { Module } from '@nestjs/common';

import { AdminNavigationController } from './admin-navigation.controller';
import { NavigationService } from './navigation.service';

@Module({
  controllers: [AdminNavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}
