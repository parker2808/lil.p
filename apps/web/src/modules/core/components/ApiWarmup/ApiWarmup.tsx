'use client';

import { useEffect } from 'react';

import { publicApiUrl } from '@/modules/core/utils/public-api-url.util';

/**
 * Softens Render free-tier cold starts (T61). Hits GET /api/health as soon as
 * the shell mounts. `no-cors` is enough to wake the service; we do not read
 * the body.
 */
export function ApiWarmup() {
  useEffect(() => {
    void fetch(publicApiUrl('/api/health'), {
      cache: 'no-store',
      credentials: 'omit',
      mode: 'no-cors',
    }).catch(() => undefined);
  }, []);
  return null;
}
