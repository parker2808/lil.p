import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

/** A prior real-API run may leave published responses in Next's fetch cache. */
export default function clearCustomPageCache() {
  rmSync(resolve(import.meta.dirname, '../../.next/cache/fetch-cache'), {
    recursive: true,
    force: true,
  });
}
