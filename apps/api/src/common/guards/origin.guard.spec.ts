import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { OriginGuard } from './origin.guard';

const WEB = 'http://localhost:3000';

function ctx(method: string, origin?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method, headers: { origin } }),
    }),
  };
}

describe('OriginGuard', () => {
  const guard = new OriginGuard({ webOrigin: WEB } as never);

  it('allows GET without an Origin', () => {
    expect(guard.canActivate(ctx('GET') as never)).toBe(true);
  });

  it('rejects a missing or foreign Origin on writes', () => {
    expect(() => guard.canActivate(ctx('POST') as never)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx('PATCH', 'https://evil.test') as never)).toThrow(
      ForbiddenException,
    );
  });

  it('allows a write from WEB_ORIGIN', () => {
    expect(guard.canActivate(ctx('POST', WEB) as never)).toBe(true);
  });
});
