import type { CookieOptions, Response } from 'express';

import type { AppConfigService } from '../../config/app-config.service';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

export const ACCESS_COOKIE_PATH = '/';
export const REFRESH_COOKIE_PATH = '/api/auth';

/**
 * Cookie flags from PLAN D24 / D28. Secure is on whenever NODE_ENV=production
 * (T59). SameSite is None (and Secure) when CROSS_SITE_COOKIES=1 so the
 * Vercel site can send cookies to the Render API (T61). Local compose stays Lax.
 */
export function authCookieFlags(
  isProduction: boolean,
  crossSite = false,
): Pick<CookieOptions, 'httpOnly' | 'sameSite' | 'secure'> {
  return {
    httpOnly: true,
    sameSite: isProduction && crossSite ? 'none' : 'lax',
    secure: isProduction,
  };
}

function cookieOptions(
  config: AppConfigService,
  path: string,
  maxAgeSeconds: number,
): CookieOptions {
  return {
    ...authCookieFlags(config.isProduction, config.crossSiteCookies),
    path,
    domain: config.cookieDomain,
    maxAge: maxAgeSeconds * 1000,
  };
}

export function setAuthCookies(
  res: Response,
  tokens: { access: string; refresh: string },
  config: AppConfigService,
): void {
  res.cookie(
    ACCESS_COOKIE,
    tokens.access,
    cookieOptions(config, ACCESS_COOKIE_PATH, config.jwtAccessTtlSeconds),
  );
  res.cookie(
    REFRESH_COOKIE,
    tokens.refresh,
    cookieOptions(config, REFRESH_COOKIE_PATH, config.jwtRefreshTtlSeconds),
  );
}

export function clearAuthCookies(res: Response, config: AppConfigService): void {
  res.clearCookie(ACCESS_COOKIE, cookieOptions(config, ACCESS_COOKIE_PATH, 0));
  res.clearCookie(REFRESH_COOKIE, cookieOptions(config, REFRESH_COOKIE_PATH, 0));
}
