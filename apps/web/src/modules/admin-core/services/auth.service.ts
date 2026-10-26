import type { LoginInput, Me } from '@portfolio/contracts';
import { meSchema } from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

export async function login(input: LoginInput): Promise<Me> {
  const me = await apiClient<Me>('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return meSchema.parse(me);
}

export async function fetchMe(): Promise<Me> {
  return meSchema.parse(await apiClient<Me>('/api/auth/me'));
}

export async function logout(): Promise<void> {
  await apiClient<void>('/api/auth/logout', { method: 'POST' });
}
