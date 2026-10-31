import { headers } from 'next/headers';

/**
 * CSP nonce set by `proxy.ts` on /admin and draft-mode requests only; public
 * routes outside draft mode are static and must not call this.
 */
export async function requestNonce(): Promise<string | undefined> {
  return (await headers()).get('x-nonce') ?? undefined;
}
