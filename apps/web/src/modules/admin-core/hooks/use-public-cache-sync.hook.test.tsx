import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const revalidatePublicContent = vi.hoisted(() => vi.fn(async () => true));

vi.mock('../actions/revalidate-public.action', () => ({ revalidatePublicContent }));

import { PUBLIC_CACHE_SYNC_DEBOUNCE_MS, usePublicCacheSync } from './use-public-cache-sync.hook';

function setup(mutationFn: () => Promise<unknown>) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(
    () => {
      usePublicCacheSync();
      return useMutation({ mutationFn });
    },
    { wrapper },
  );
}

describe('usePublicCacheSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    revalidatePublicContent.mockClear();
  });

  it('expires the public cache once after a burst of successful saves', async () => {
    const { result } = setup(async () => 'ok');

    await act(async () => {
      await result.current.mutateAsync();
      await result.current.mutateAsync();
    });
    expect(revalidatePublicContent).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(PUBLIC_CACHE_SYNC_DEBOUNCE_MS);
    });
    expect(revalidatePublicContent).toHaveBeenCalledTimes(1);
  });

  it('ignores failed mutations', async () => {
    const { result } = setup(async () => {
      throw new Error('nope');
    });

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined);
      vi.advanceTimersByTime(PUBLIC_CACHE_SYNC_DEBOUNCE_MS);
    });
    expect(revalidatePublicContent).not.toHaveBeenCalled();
  });

  it('flushes a pending expiry when the admin shell unmounts', async () => {
    const { result, unmount } = setup(async () => 'ok');

    await act(async () => {
      await result.current.mutateAsync();
    });
    unmount();
    expect(revalidatePublicContent).toHaveBeenCalledTimes(1);
  });
});
