'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { z } from 'zod';

import { paramsFromSearch, searchFromParams } from '../utils/list-query.util';

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

  const params = useMemo(() => paramsFromSearch(schema, search), [schema, search]);

  const setParams = useCallback(
    (patch: Partial<z.output<T>>, options?: SetParamsOptions) => {
      const encoded = searchFromParams(schema.parse({ ...params, ...patch }), search);
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
