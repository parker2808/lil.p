/**
 * Public routes the admin can pick for `NavItem.href`.
 * Locale prefixes (`/en`, `/vi`) are added by the web app, not stored.
 */
export const PUBLIC_ROUTES = ['/', '/about', '/projects', '/notes', '/contact'] as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

export const publicRouteSchema = {
  values: PUBLIC_ROUTES,
};
