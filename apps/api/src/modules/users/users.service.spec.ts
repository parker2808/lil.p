import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { UsersService } from './users.service';

const adminEmail = ['admin', 'example.com'].join('@');

describe('UsersService', () => {
  it('hashes the password with argon2id and never stores the plain value', async () => {
    const create = vi.fn().mockResolvedValue({
      id: 1,
      email: adminEmail,
      name: 'Admin',
      passwordHash: 'hashed',
      role: 'admin',
      isActive: true,
      tokenVersion: 0,
      lastLoginAt: null,
      updatedAt: new Date(),
    });
    const service = new UsersService({ user: { create } } as never);
    await service.create({
      email: adminEmail,
      name: 'Admin',
      password: 'plain-password-12',
      role: 'admin',
    });
    const data = create.mock.calls[0]?.[0].data as { passwordHash: string };
    expect(data.passwordHash).not.toBe('plain-password-12');
    expect(data.passwordHash.startsWith('$argon2')).toBe(true);
  });

  it('refuses to demote the last active admin', async () => {
    const current = {
      id: 1,
      email: adminEmail,
      name: 'Admin',
      role: 'admin',
      isActive: true,
      passwordHash: 'x',
      tokenVersion: 0,
      lastLoginAt: null,
      updatedAt: new Date(),
    };
    const service = new UsersService({
      $transaction: (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          user: {
            findUnique: vi.fn().mockResolvedValue(current),
            count: vi.fn().mockResolvedValue(0),
            update: vi.fn(),
          },
        }),
    } as never);

    await expect(service.update(2, 1, { role: 'user' })).rejects.toBeInstanceOf(ConflictException);
  });
});
