/**
 * Public routes the admin can pick for `NavItem.href`.
 * Locale prefixes (`/en`, `/vi`) are added by the web app, not stored.
 */
export const PUBLIC_ROUTES = ['/', '/about', '/projects', '/notes', '/contact'] as const;

/** One-segment paths owned by public routes, including routes pending branch integration. */
export const RESERVED_PUBLIC_PAGE_SLUGS = [
  'about',
  'projects',
  'notes',
  'contact',
  'craft',
] as const;

export function isReservedPublicPageSlug(slug: string): boolean {
  return (RESERVED_PUBLIC_PAGE_SLUGS as readonly string[]).includes(slug);
}

export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

export const publicRouteSchema = {
  values: PUBLIC_ROUTES,
};
