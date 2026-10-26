import { describe, expect, it } from 'vitest';

import { authCookieFlags } from './auth-cookies.util';

describe('authCookieFlags', () => {
  it('sets Secure only in production', () => {
    expect(authCookieFlags(true)).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    expect(authCookieFlags(false)).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });
  });
});
