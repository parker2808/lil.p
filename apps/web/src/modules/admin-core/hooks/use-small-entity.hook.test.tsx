import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useMoveSmallEntity } from './use-small-entity.hook';

const list = vi.fn();
const reorder = vi.fn();
const api = {
  list,
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  reorder,
};

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useMoveSmallEntity', () => {
  it('reorders domains by swapping adjacent ids', async () => {
    list.mockResolvedValue([
      { id: 2, sortOrder: 0 },
      { id: 5, sortOrder: 1 },
    ]);
    reorder.mockResolvedValue(undefined);
    const client = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
    const { result } = renderHook(() => useMoveSmallEntity('domains', api), {
      wrapper: wrapper(client),
    });

    await act(async () => {
      result.current.mutate({ id: 2, direction: 1 });
    });

    await waitFor(() => {
      expect(reorder).toHaveBeenCalledWith([5, 2]);
    });
  });
});
