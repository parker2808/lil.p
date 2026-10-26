import { Module } from '@nestjs/common';

import { AdminEventsController } from './admin-events.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [AdminEventsController],
  providers: [EventsService],
})
export class EventsModule {}
