import { createHash } from 'node:crypto';

import type { Request } from 'express';

export function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function requestIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    const first = forwarded.split(',')[0];
    if (first) {
      return first.trim();
    }
  }
  return req.ip ?? 'unknown';
}

/** SHA-256 of IP + secret + UTC day so hashes cannot be linked across days. */
export function hashIp(ip: string, salt: string, date = new Date()): string {
  return createHash('sha256')
    .update(`${ip}\0${salt}\0${utcDayKey(date)}`)
    .digest('hex');
}
