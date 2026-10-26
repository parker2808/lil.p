import { createHash } from 'node:crypto';

import type { ViewDevice } from '@portfolio/contracts';

import { utcDayKey } from '../../common/utils/ip-hash.util';

const PUBLIC_PATH = /^\/(?:about|projects(?:\/[\w-]+)?|notes(?:\/[\w-]+)?|contact)?\/?$/;

export function isPublicViewPath(path: string): boolean {
  return PUBLIC_PATH.test(path);
}

export function referrerHost(referrer: string | undefined, siteHost: string): string | null {
  if (!referrer) {
    return null;
  }
  try {
    const url = new URL(referrer);
    if (url.hostname === siteHost || url.hostname === `www.${siteHost}`) {
      return null;
    }
    return url.hostname.slice(0, 200);
  } catch {
    return null;
  }
}

export function deviceFromUa(ua: string): ViewDevice {
  if (/iPad|Tablet/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function isBotUa(ua: string): boolean {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit/i.test(ua);
}

export function visitorHash(ip: string, ua: string, salt: string, date = new Date()): string {
  return createHash('sha256')
    .update(`${ip}\0${ua}\0${salt}\0${utcDayKey(date)}`)
    .digest('hex');
}
