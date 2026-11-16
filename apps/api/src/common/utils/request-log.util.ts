import { createHmac, randomBytes } from 'node:crypto';

import type { Request } from 'express';

type RequestWithLogContext = Request & { requestId?: string };
const logKey = randomBytes(32);

export function requestLogContext(
  request: RequestWithLogContext,
  requestId = request.requestId,
): string {
  const route = request.route as { path?: unknown } | undefined;
  const path = typeof route?.path === 'string' ? route.path : '/unmatched';
  const method = /^[A-Z]{1,12}$/.test(request.method) ? request.method : 'UNKNOWN';
  const fingerprint = requestId
    ? createHmac('sha256', logKey).update(requestId).digest('hex').slice(0, 16)
    : '-';
  return `${method} ${path} request=${fingerprint}`;
}
