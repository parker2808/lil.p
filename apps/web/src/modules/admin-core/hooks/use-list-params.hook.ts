'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { z } from 'zod';

export type SetParamsOptions = {
  /** `push` adds a history entry without a server round trip, so Back restores the previous view. */
  history?: 'replace' | 'push';
};

export function useListParams<T extends z.ZodType<Record<string, unknown>>>(
  schema: T,
): {
  params: z.output<T>;
  setParams: (patch: Partial<z.output<T>>, options?: SetParamsOptions) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const params = useMemo(() => {
    const raw = Object.fromEntries(search.entries());
    return schema.parse(raw);
  }, [schema, search]);

  const setParams = useCallback(
    (patch: Partial<z.output<T>>, options?: SetParamsOptions) => {
      const next = schema.parse({ ...params, ...patch });
      const query = new URLSearchParams();
      const parentTab = search.get('tab');
      if (parentTab) query.set('tab', parentTab);
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === '' || value === null) {
          continue;
        }
        if (key === 'page' && value === 1) {
          continue;
        }
        if (key === 'pageSize' && value === 20) {
          continue;
        }
        query.set(key, String(value));
      }
      const encoded = query.toString();
      const url = encoded ? `${pathname}?${encoded}` : pathname;
      if (options?.history === 'push') {
        if (url !== `${window.location.pathname}${window.location.search}`) {
          window.history.pushState(null, '', url);
        }
        return;
      }
      router.replace(url);
    },
    [params, pathname, router, schema, search],
  );

  return { params, setParams };
}
