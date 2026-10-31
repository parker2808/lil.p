import { headers } from 'next/headers';

/** CSP nonce set by `proxy.ts` on /admin requests only (public routes are static). */
export async function requestNonce(): Promise<string | undefined> {
  return (await headers()).get('x-nonce') ?? undefined;
}
