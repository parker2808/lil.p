import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { EventsService } from './events.service';

describe('EventsService', () => {
  it('forwards contact.created without the email or body', async () => {
    const service = new EventsService();
    const pending = firstValueFrom(service.stream());
    service.onContactCreated({ id: 9, name: 'Ana' });
    await expect(pending).resolves.toEqual({
      type: 'contact.created',
      data: { id: 9, name: 'Ana' },
    });
  });
});
