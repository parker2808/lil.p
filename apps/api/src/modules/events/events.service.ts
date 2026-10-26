import { Injectable, type MessageEvent } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { interval, merge, type Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const HEARTBEAT_MS = 25_000;

export type ContactCreatedEvent = { id: number; name: string };

@Injectable()
export class EventsService {
  private readonly bus = new Subject<MessageEvent>();

  @OnEvent('contact.created')
  onContactCreated(payload: ContactCreatedEvent): void {
    this.bus.next({ type: 'contact.created', data: payload });
  }

  stream(): Observable<MessageEvent> {
    return merge(
      this.bus.asObservable(),
      interval(HEARTBEAT_MS).pipe(
        map(() => ({ type: 'heartbeat', data: '' }) satisfies MessageEvent),
      ),
    );
  }
}
