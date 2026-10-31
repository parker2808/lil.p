'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { revalidatePublicContent } from '../actions/revalidate-public.action';

export const PUBLIC_CACHE_SYNC_DEBOUNCE_MS = 1000;

/**
 * Public pages are static/ISR, so every successful admin mutation (autosaves
 * included) expires their cache. Bursts collapse into one call; a pending call
 * still fires when the admin shell unmounts.
 */
export function usePublicCacheSync(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const flush = () => {
      timer = undefined;
      void revalidatePublicContent().catch(() => undefined);
    };
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'success') {
        clearTimeout(timer);
        timer = setTimeout(flush, PUBLIC_CACHE_SYNC_DEBOUNCE_MS);
      }
    });
    return () => {
      unsubscribe();
      if (timer) {
        clearTimeout(timer);
        flush();
      }
    };
  }, [queryClient]);
}
