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

  it('uses SameSite=None with Secure for a cross-site production API', () => {
    expect(authCookieFlags(true, true)).toEqual({
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
  });
});
