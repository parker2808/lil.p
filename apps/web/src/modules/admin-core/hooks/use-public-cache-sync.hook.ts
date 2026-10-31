'use client';

import { type Mutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { revalidatePublicContent } from '../actions/revalidate-public.action';
import type {} from '../types/mutation-meta.type';

export const PUBLIC_CACHE_SYNC_DEBOUNCE_MS = 1000;

function isDraft(data: unknown): boolean {
  return typeof data === 'object' && data !== null && 'status' in data && data.status === 'DRAFT';
}

export function changesPublicContent(mutation: Mutation<unknown, unknown, unknown, unknown>) {
  const mode = mutation.meta?.publicCache;
  if (mode === 'skip') {
    return false;
  }
  return mode === 'unless-draft' ? !isDraft(mutation.state.data) : true;
}

/**
 * Public pages are static/ISR, so successful admin mutations that change live
 * content expire their cache (see `PublicCacheMode` for the ones that do not).
 * Bursts collapse into one call; a pending call still fires when the admin
 * shell unmounts.
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
      if (
        event.type === 'updated' &&
        event.action.type === 'success' &&
        changesPublicContent(event.mutation)
      ) {
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
