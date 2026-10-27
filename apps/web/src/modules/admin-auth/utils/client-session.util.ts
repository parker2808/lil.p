import { refreshOnce } from '@/modules/core/services/api-client.service';
import { publicApiUrl } from '@/modules/core/utils/public-api-url.util';

export const ADMIN_LOGIN_AUTO_REDIRECT_KEY = 'admin-login-autoredirect';

export function hasAdminLoginAutoRedirected(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_LOGIN_AUTO_REDIRECT_KEY) === '1';
  } catch {
    return false;
  }
}

export function markAdminLoginAutoRedirected(): void {
  try {
    sessionStorage.setItem(ADMIN_LOGIN_AUTO_REDIRECT_KEY, '1');
  } catch {
    // Private mode or a blocked storage API — the in-component ref still guards this tab.
  }
}

/** True only when a client-side `/api/auth/me` succeeds (refresh may run first). */
export async function clientHasAdminSession(): Promise<boolean> {
  const url = publicApiUrl('/api/auth/me');
  try {
    const first = await fetch(url, { credentials: 'include' });
    if (first.ok) {
      return true;
    }
    if (first.status !== 401) {
      return false;
    }
    const refreshed = await refreshOnce();
    if (!refreshed) {
      return false;
    }
    const retry = await fetch(url, { credentials: 'include' });
    return retry.ok;
  } catch {
    return false;
  }
}
