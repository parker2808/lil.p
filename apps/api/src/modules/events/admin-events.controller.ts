import { Controller, Header, type MessageEvent, Sse } from '@nestjs/common';
import type { Observable } from 'rxjs';

import { EventsService } from './events.service';

@Controller('admin')
export class AdminEventsController {
  constructor(private readonly events: EventsService) {}

  @Sse('events')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('X-Accel-Buffering', 'no')
  stream(): Observable<MessageEvent> {
    return this.events.stream();
  }
}
