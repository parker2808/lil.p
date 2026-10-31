import '@tanstack/react-query';

/**
 * How a successful admin mutation affects the cached public site (see
 * `usePublicCacheSync`). Unset means the mutation changes live public content.
 * - `skip`: draft-only or non-public data (page builder before publish, inbox, users).
 * - `unless-draft`: entity saves that only reach the public site once published.
 */
export type PublicCacheMode = 'skip' | 'unless-draft';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { publicCache?: PublicCacheMode };
  }
}
