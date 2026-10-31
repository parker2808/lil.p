/**
 * Content-Security-Policy (T59).
 *
 * With a nonce (admin, always dynamic): Next 16 applies it to its own scripts
 * when this header is set on both the request (so RSC sees it) and the response.
 *
 * Without a nonce (public `[locale]` routes, static/ISR): the cached HTML is
 * shared by every visitor, so a per-request nonce cannot match it. Next's
 * inline RSC/bootstrap scripts differ per page and per build, so hashes are not
 * practical either; `'unsafe-inline'` is the only option Next supports there.
 * Every other directive is identical to the admin policy.
 *
 * `frame-ancestors 'self'` (not `'none'`) lets the page builder's live preview
 * iframe the public site from the same origin (T52a); no other site may frame us.
 *
 * `upgrade-insecure-requests` stays off here so local HTTP Caddy still works;
 * T61 adds it once the origin is HTTPS.
 */
export function buildContentSecurityPolicy(
  nonce: string | undefined,
  extraConnectSrc: string[] = [],
): string {
  const connect = ["'self'", ...extraConnectSrc.filter(Boolean)].join(' ');
  return [
    "default-src 'self'",
    nonce
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self'",
    `connect-src ${connect}`,
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
    "media-src 'self'",
  ].join('; ');
}

export const SECURITY_HEADER_NAMES = {
  contentTypeOptions: 'X-Content-Type-Options',
  referrerPolicy: 'Referrer-Policy',
  permissionsPolicy: 'Permissions-Policy',
  frameOptions: 'X-Frame-Options',
} as const;

export const SECURITY_HEADER_VALUES = {
  contentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  frameOptions: 'SAMEORIGIN',
} as const;
