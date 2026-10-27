import { afterEach, describe, expect, it, vi } from 'vitest';

const { refreshOnce } = vi.hoisted(() => ({ refreshOnce: vi.fn() }));

vi.mock('@/modules/core/services/api-client.service', () => ({
  refreshOnce: () => refreshOnce(),
}));

import {
  ADMIN_LOGIN_AUTO_REDIRECT_KEY,
  clientHasAdminSession,
  hasAdminLoginAutoRedirected,
  markAdminLoginAutoRedirected,
} from './client-session.util';

describe('clientHasAdminSession', () => {
  afterEach(() => {
    refreshOnce.mockReset();
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('is true when /api/auth/me succeeds without refresh', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    await expect(clientHasAdminSession()).resolves.toBe(true);
    expect(refreshOnce).not.toHaveBeenCalled();
  });

  it('is true only after refresh plus a successful /api/auth/me', async () => {
    refreshOnce.mockResolvedValue(true);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    await expect(clientHasAdminSession()).resolves.toBe(true);
    expect(refreshOnce).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('is false when refresh succeeds but /api/auth/me still fails', async () => {
    refreshOnce.mockResolvedValue(true);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(clientHasAdminSession()).resolves.toBe(false);
  });

  it('tracks a one-shot auto-redirect in sessionStorage', () => {
    expect(hasAdminLoginAutoRedirected()).toBe(false);
    markAdminLoginAutoRedirected();
    expect(hasAdminLoginAutoRedirected()).toBe(true);
    expect(sessionStorage.getItem(ADMIN_LOGIN_AUTO_REDIRECT_KEY)).toBe('1');
  });
});
