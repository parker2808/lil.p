import { isReservedPublicPageSlug, pageKeySchema, type PageKey } from '@portfolio/contracts';

/** Catch-all routes may resolve only one unreserved CMS slug. */
export function customPageKey(rest: string[]): PageKey | null {
  if (rest.length !== 1) return null;
  const parsed = pageKeySchema.safeParse(rest[0]);
  return parsed.success && !isReservedPublicPageSlug(parsed.data) ? parsed.data : null;
}
