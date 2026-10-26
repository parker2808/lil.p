/** Browser-facing API origin. Empty means same-origin `/api/*` (Next rewrite). */
export function publicApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
}

export function publicApiUrl(path: string): string {
  const url = path.startsWith('/') ? path : `/${path}`;
  return `${publicApiBase()}${url}`;
}
