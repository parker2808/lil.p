'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { z } from 'zod';

export function useListParams<T extends z.ZodType<Record<string, unknown>>>(
  schema: T,
): {
  params: z.output<T>;
  setParams: (patch: Partial<z.output<T>>) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const params = useMemo(() => {
    const raw = Object.fromEntries(search.entries());
    return schema.parse(raw);
  }, [schema, search]);

  const setParams = useCallback(
    (patch: Partial<z.output<T>>) => {
      const next = schema.parse({ ...params, ...patch });
      const query = new URLSearchParams();
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
      router.replace(encoded ? `${pathname}?${encoded}` : pathname);
    },
    [params, pathname, router, schema],
  );

  return { params, setParams };
}
