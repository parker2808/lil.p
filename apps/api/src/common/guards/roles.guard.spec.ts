import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

function context(user?: { id: number; role: string }, handlerMeta?: unknown, classMeta?: unknown) {
  const reflector = {
    getAllAndOverride: (key: string) => {
      if (key === IS_PUBLIC_KEY) return handlerMeta === 'public' || classMeta === 'public';
      if (key === ROLES_KEY)
        return handlerMeta === 'public' ? undefined : (handlerMeta ?? classMeta);
      return undefined;
    },
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);
  const ctx = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  };
  return { guard, ctx };
}

describe('RolesGuard', () => {
  it('skips @Public() routes', () => {
    const { guard, ctx } = context(undefined, 'public');
    expect(guard.canActivate(ctx as never)).toBe(true);
  });

  it('defaults to admin only when no @Roles() is set', () => {
    const { guard, ctx } = context({ id: 1, role: 'user' });
    expect(() => guard.canActivate(ctx as never)).toThrow(ForbiddenException);
  });

  it('allows a user on a route decorated for both roles', () => {
    const { guard, ctx } = context({ id: 1, role: 'user' }, ['admin', 'user']);
    expect(guard.canActivate(ctx as never)).toBe(true);
  });
});
