'use client';

import { qk } from '@portfolio/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { restoreQueries, snapshotQueries } from '../utils/optimistic.util';
import type { AdminEntityApi } from '../services/small-entity.service';

export function useSmallEntityList<T extends { id: number }>(
  entity: string,
  api: AdminEntityApi<T>,
) {
  return useQuery({
    queryKey: qk.admin.all(entity),
    queryFn: () => api.list(),
  });
}

export function useCreateSmallEntity<T extends { id: number }>(
  entity: string,
  api: AdminEntityApi<T>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.create(body),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all(entity) });
    },
  });
}

export function useUpdateSmallEntity<T extends { id: number }>(
  entity: string,
  api: AdminEntityApi<T>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: unknown }) => api.update(id, body),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all(entity) });
    },
  });
}

export function useRemoveSmallEntity<T extends { id: number }>(
  entity: string,
  api: AdminEntityApi<T>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.admin.all(entity) });
      const snapshots = snapshotQueries<T[]>(queryClient, qk.admin.all(entity));
      queryClient.setQueryData<T[]>(qk.admin.all(entity), (current) =>
        current ? current.filter((item) => item.id !== id) : current,
      );
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      if (context?.snapshots) {
        restoreQueries(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all(entity) });
    },
  });
}

export function useToggleSmallEntityVisible<T extends { id: number; isVisible: boolean }>(
  entity: string,
  api: AdminEntityApi<T>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: T) => api.update(item.id, { isVisible: !item.isVisible }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: qk.admin.all(entity) });
      const snapshots = snapshotQueries<T[]>(queryClient, qk.admin.all(entity));
      queryClient.setQueryData<T[]>(qk.admin.all(entity), (current) =>
        current
          ? current.map((row) => (row.id === item.id ? { ...row, isVisible: !row.isVisible } : row))
          : current,
      );
      return { snapshots };
    },
    onError: (_error, _item, context) => {
      if (context?.snapshots) {
        restoreQueries(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all(entity) });
    },
  });
}

export function useMoveSmallEntity<T extends { id: number }>(
  entity: string,
  api: AdminEntityApi<T>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: -1 | 1 }) => {
      const items = await api.list();
      const ids = items.map((item) => item.id);
      const index = ids.indexOf(id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= ids.length) {
        return;
      }
      const swap = ids[next];
      const current = ids[index];
      if (swap === undefined || current === undefined) {
        return;
      }
      ids[index] = swap;
      ids[next] = current;
      await api.reorder(ids);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all(entity) });
      if (entity === 'domains') {
        void queryClient.invalidateQueries({ queryKey: ['public'] });
      }
    },
  });
}
