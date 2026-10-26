import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
    if (isLogin) {
      return NextResponse.next();
    }
    if (!request.cookies.get('access_token')) {
      const login = request.nextUrl.clone();
      login.pathname = '/admin/login';
      login.search = '';
      login.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return handleI18n(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
