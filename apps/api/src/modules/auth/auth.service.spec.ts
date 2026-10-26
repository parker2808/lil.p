import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('returns the same INVALID_CREDENTIALS for unknown, wrong, and inactive', async () => {
    const passwordHash = await argon2.hash('correct-password', { type: argon2.argon2id });
    const active = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash,
      role: 'admin' as const,
      isActive: true,
      tokenVersion: 0,
      lastLoginAt: null,
      updatedAt: new Date(),
    };
    const findByEmail = vi.fn();
    const service = new AuthService(
      { findByEmail, touchLastLogin: vi.fn(), findById: vi.fn() } as never,
      { signAccess: vi.fn(), signRefresh: vi.fn() } as never,
    );

    findByEmail.mockResolvedValueOnce(null);
    await expect(
      service.login({ email: 'missing@example.com', password: 'correct-password' }),
    ).rejects.toMatchObject({ response: { code: 'INVALID_CREDENTIALS' } });

    findByEmail.mockResolvedValueOnce({ ...active, isActive: false });
    await expect(
      service.login({ email: active.email, password: 'correct-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    findByEmail.mockResolvedValueOnce(active);
    await expect(service.login({ email: active.email, password: 'wrong' })).rejects.toMatchObject({
      response: { code: 'INVALID_CREDENTIALS' },
    });
  });

  it('issues a token pair and never returns the password hash on success', async () => {
    const passwordHash = await argon2.hash('correct-password', { type: argon2.argon2id });
    const user = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash,
      role: 'admin' as const,
      isActive: true,
      tokenVersion: 0,
      lastLoginAt: null,
      updatedAt: new Date(),
    };
    const touchLastLogin = vi.fn().mockResolvedValue({ ...user, lastLoginAt: new Date() });
    const signAccess = vi.fn().mockResolvedValue('access.jwt');
    const signRefresh = vi.fn().mockResolvedValue('refresh.jwt');
    const service = new AuthService(
      { findByEmail: vi.fn().mockResolvedValue(user), touchLastLogin, findById: vi.fn() } as never,
      { signAccess, signRefresh } as never,
    );

    const result = await service.login({ email: user.email, password: 'correct-password' });
    expect(touchLastLogin).toHaveBeenCalledWith(1);
    expect(result.access).toBe('access.jwt');
    expect(result.refresh).toBe('refresh.jwt');
    expect(JSON.stringify(result.user)).not.toMatch(/correct-password/);
  });
});
