export type ContactActionResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string[]>; formError?: 'rateLimited' | 'failed' };
