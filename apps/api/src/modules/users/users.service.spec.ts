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
});
