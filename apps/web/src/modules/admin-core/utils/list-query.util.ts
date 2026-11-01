import type { z } from 'zod';

const DEFAULTS: Readonly<Record<string, unknown>> = { page: 1, pageSize: 20 };

/** A hand-edited or stale URL value is dropped instead of failing the page. */
export function paramsFromSearch<T extends z.ZodType<Record<string, unknown>>>(
  schema: T,
  search: URLSearchParams,
): z.output<T> {
  const raw = Object.fromEntries(search.entries());
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  const invalid = new Set(parsed.error.issues.map((issue) => String(issue.path[0])));
  return schema.parse(Object.fromEntries(Object.entries(raw).filter(([key]) => !invalid.has(key))));
}

/** Empty values and defaults stay out of the URL; a parent view's `tab` is kept. */
export function searchFromParams(
  params: Record<string, unknown>,
  current?: URLSearchParams,
): string {
  const query = new URLSearchParams();
  const parentTab = current?.get('tab');
  if (parentTab) query.set('tab', parentTab);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === null || DEFAULTS[key] === value) {
      continue;
    }
    query.set(key, String(value));
  }
  return query.toString();
}
