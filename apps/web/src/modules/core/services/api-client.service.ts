import { apiErrorFromResponse } from '../utils/api-error.util';
import { publicApiUrl } from '../utils/public-api-url.util';

const AUTH_PATHS = ['/api/admin/', '/api/auth/me'];

let refreshPromise: Promise<boolean> | null = null;

function needsAuthRefresh(path: string): boolean {
  return AUTH_PATHS.some((prefix) => path === prefix || path.startsWith(prefix));
}

export async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(publicApiUrl('/api/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => response.ok)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function apiClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = publicApiUrl(path.startsWith('/') ? path : `/${path}`);
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    signal: init.signal,
  });

  if (response.status === 401 && needsAuthRefresh(url) && typeof window !== 'undefined') {
    const refreshed = await refreshOnce();
    if (refreshed) {
      const retry = await fetch(url, { credentials: 'include', ...init, signal: init.signal });
      if (retry.ok) {
        return parseBody<T>(retry);
      }
    }
    const next = safeAdminNextFromLocation();
    // Full navigation so the expired session cannot keep retrying in-place.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/admin/login?next=${encodeURIComponent(next)}`);
    throw await apiErrorFromResponse(response);
  }

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  return parseBody<T>(response);
}

function safeAdminNextFromLocation(): string {
  const path = window.location.pathname;
  return path.startsWith('/admin') ? `${path}${window.location.search}` : '/admin';
}
