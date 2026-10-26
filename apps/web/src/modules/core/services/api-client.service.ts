import { apiErrorFromResponse } from '../utils/api-error.util';

export async function apiClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path.startsWith('/') ? path : `/${path}`, {
    ...init,
    signal: init.signal,
  });

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  return (await response.json()) as T;
}
