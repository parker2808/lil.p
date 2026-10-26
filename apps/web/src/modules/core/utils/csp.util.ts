/**
 * Per-request Content-Security-Policy (T59).
 *
 * Next 16 applies the nonce to its own scripts when this header is set on both
 * the request (so RSC sees it) and the response. `frame-ancestors 'self'`
 * (not `'none'`) lets the page builder's live preview iframe the public site
 * from the same origin (T52a); no other site may frame us.
 *
 * `upgrade-insecure-requests` stays off here so local HTTP Caddy still works;
 * T61 adds it once the origin is HTTPS.
 */
export function buildContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self'",
    "connect-src 'self'",
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
