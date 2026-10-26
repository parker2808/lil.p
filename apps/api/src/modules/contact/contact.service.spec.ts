import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactService } from './contact.service';

const visitorEmail = ['visitor', 'example.com'].join('@');

function prismaMock() {
  return {
    contactTopic: {
      findFirst: vi.fn(),
    },
    contactMessage: {
      create: vi.fn().mockResolvedValue({ id: 9, name: 'Ana' }),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}

describe('ContactService', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let events: { emit: ReturnType<typeof vi.fn> };
  let service: ContactService;

  beforeEach(() => {
    prisma = prismaMock();
    events = { emit: vi.fn() };
    service = new ContactService(
      prisma as never,
      events as never,
      { jwtAccessSecret: 'test-salt' } as never,
    );
  });

  it('stores a honeypot as SPAM and does not emit', async () => {
    await service.submit(
      {
        name: 'Ana',
        email: visitorEmail,
        message: 'Hello from the form',
        website: 'https://spam.test',
        locale: 'en',
      },
      { headers: {}, ip: '203.0.113.10' } as never,
    );
    const data = prisma.contactMessage.create.mock.calls[0]?.[0].data as {
      status: string;
      email: string;
    };
    expect(data.status).toBe('SPAM');
    expect(data.email).toBe(visitorEmail);
    expect(events.emit).not.toHaveBeenCalled();
  });

  it('emits contact.created without the email or body', async () => {
    await service.submit(
      {
        name: 'Ana',
        email: visitorEmail,
        message: 'Hello from the form',
        website: '',
        locale: 'en',
      },
      { headers: {}, ip: '203.0.113.10' } as never,
    );
    expect(events.emit).toHaveBeenCalledWith('contact.created', { id: 9, name: 'Ana' });
    expect(JSON.stringify(events.emit.mock.calls)).not.toContain(visitorEmail);
    expect(JSON.stringify(events.emit.mock.calls)).not.toContain('Hello from the form');
  });

  it('rejects an unknown topic', async () => {
    prisma.contactTopic.findFirst.mockResolvedValue(null);
    await expect(
      service.submit(
        {
          name: 'Ana',
          email: visitorEmail,
          topic: 'missing',
          message: 'Hello from the form',
          website: '',
          locale: 'en',
        },
        { headers: {}, ip: '203.0.113.10' } as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
