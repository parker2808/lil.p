import { headers } from 'next/headers';

/** CSP nonce set by `proxy.ts` on every matched request. */
export async function requestNonce(): Promise<string | undefined> {
  return (await headers()).get('x-nonce') ?? undefined;
}
