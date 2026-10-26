import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';
import {
  buildContentSecurityPolicy,
  SECURITY_HEADER_NAMES,
  SECURITY_HEADER_VALUES,
} from './src/modules/core/utils/csp.util';

const handleI18n = createMiddleware(routing);

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
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildContentSecurityPolicy(nonce);
  const secured = requestWithNonce(request, nonce, csp);
  const { pathname } = secured.nextUrl;

  if (pathname.startsWith('/admin')) {
    const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
    if (isLogin) {
      return applySecurityHeaders(
        NextResponse.next({ request: { headers: secured.headers } }),
        csp,
      );
    }
    if (!secured.cookies.get('access_token')) {
      const login = secured.nextUrl.clone();
      login.pathname = '/admin/login';
      login.search = '';
      login.searchParams.set('next', `${pathname}${secured.nextUrl.search}`);
      return applySecurityHeaders(NextResponse.redirect(login), csp);
    }
    return applySecurityHeaders(NextResponse.next({ request: { headers: secured.headers } }), csp);
  }

  return applySecurityHeaders(handleI18n(secured), csp);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
