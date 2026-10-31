import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';
import {
  buildContentSecurityPolicy,
  SECURITY_HEADER_NAMES,
  SECURITY_HEADER_VALUES,
} from './src/modules/core/utils/csp.util';

const handleI18n = createMiddleware(routing);

const adminRoutes = new Set([
  'analytics',
  'audit',
  'domains',
  'education',
  'experience',
  'inbox',
  'login',
  'media',
  'pages',
  'posts',
  'principles',
  'process',
  'profile',
  'projects',
  'site',
  'skills',
  'stats',
  'tags',
  'users',
]);

function applySecurityHeaders(response: NextResponse, csp: string): NextResponse {
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set(
    SECURITY_HEADER_NAMES.contentTypeOptions,
    SECURITY_HEADER_VALUES.contentTypeOptions,
  );
  response.headers.set(SECURITY_HEADER_NAMES.referrerPolicy, SECURITY_HEADER_VALUES.referrerPolicy);
  response.headers.set(
    SECURITY_HEADER_NAMES.permissionsPolicy,
    SECURITY_HEADER_VALUES.permissionsPolicy,
  );
  response.headers.set(SECURITY_HEADER_NAMES.frameOptions, SECURITY_HEADER_VALUES.frameOptions);
  return response;
}

function requestWithNonce(request: NextRequest, nonce: string, csp: string): NextRequest {
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('content-security-policy', csp);
  return new NextRequest(request, { headers });
}

export function proxy(request: NextRequest) {
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  const connectSrc = apiOrigin ? [apiOrigin] : [];
  const { pathname } = request.nextUrl;

  const isAdmin = pathname.startsWith('/admin');
  // Public pages are static/ISR and shared across visitors, so they get the
  // nonce-less policy (see csp.util.ts). /admin and draft-mode requests (the
  // site-wide bypass cookie skips the cache) render per request and get a nonce.
  if (!isAdmin && !request.cookies.has('__prerender_bypass')) {
    return applySecurityHeaders(
      handleI18n(request),
      buildContentSecurityPolicy(undefined, connectSrc),
    );
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildContentSecurityPolicy(nonce, connectSrc);
  const secured = requestWithNonce(request, nonce, csp);
  if (!isAdmin) {
    // The CSP is per request now, so no shared cache may store it. Next keeps
    // this header, and a forged cookie still gets the cached HTML.
    const response = applySecurityHeaders(handleI18n(secured), csp);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }
  const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
  // Cross-site cookies live on the Render host (D28), so this edge
  // redirect cannot see them. Admin pages handle 401 themselves.
  if (!isLogin && !apiOrigin && !secured.cookies.get('access_token')) {
    const login = secured.nextUrl.clone();
    login.pathname = '/admin/login';
    login.search = '';
    login.searchParams.set('next', `${pathname}${secured.nextUrl.search}`);
    return applySecurityHeaders(NextResponse.redirect(login), csp);
  }
  const adminSection = pathname.split('/')[2];
  const status = adminSection && !adminRoutes.has(adminSection) ? 404 : 200;
  return applySecurityHeaders(
    NextResponse.next({ request: { headers: secured.headers }, status }),
    csp,
  );
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
