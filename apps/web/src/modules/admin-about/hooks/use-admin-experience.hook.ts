'use client';

import {
  type AdminExperience,
  type AdminExperienceListPage,
  type AdminExperienceListParams,
  qk,
} from '@portfolio/contracts';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { restoreQueries, snapshotQueries } from '@/modules/admin-core/utils/optimistic.util';

import {
  getAdminExperience,
  listAdminExperience,
  removeAdminExperience,
  reorderAdminExperience,
  updateAdminExperience,
} from '../services/experience.service';

export function useAdminExperience(params: AdminExperienceListParams) {
  return useQuery({
    queryKey: qk.admin.list('experience', params),
    queryFn: () => listAdminExperience(params),
    placeholderData: keepPreviousData,
  });
}

export function usePrefetchAdminExperience() {
  const queryClient = useQueryClient();
  const timers = useRef<Map<number, number>>(new Map());

  return {
    prefetch(id: number) {
      window.clearTimeout(timers.current.get(id));
      const timer = window.setTimeout(() => {
        void queryClient.prefetchQuery({
          queryKey: qk.admin.detail('experience', id),
          queryFn: () => getAdminExperience(id),
        });
      }, 100);
      timers.current.set(id, timer);
    },
    cancel(id: number) {
      window.clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    },
  };
}

export function useToggleExperienceVisible(params: AdminExperienceListParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: AdminExperience) =>
      updateAdminExperience(item.id, {
        isVisible: !item.isVisible,
        updatedAt: item.updatedAt,
      }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: qk.admin.all('experience') });
      const snapshots = snapshotQueries<AdminExperienceListPage>(
        queryClient,
        qk.admin.list('experience', params),
      );
      queryClient.setQueryData<AdminExperienceListPage>(
        qk.admin.list('experience', params),
        (current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            items: current.items.map((row) =>
              row.id === item.id ? { ...row, isVisible: !row.isVisible } : row,
            ),
          };
        },
      );
      return { snapshots };
    },
    onError: (_error, _item, context) => {
      if (context?.snapshots) {
        restoreQueries(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('experience') });
    },
  });
}

export function useRemoveAdminExperience(params: AdminExperienceListParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeAdminExperience(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.admin.all('experience') });
      const snapshots = snapshotQueries<AdminExperienceListPage>(
        queryClient,
        qk.admin.list('experience', params),
      );
      queryClient.setQueryData<AdminExperienceListPage>(
        qk.admin.list('experience', params),
        (current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            items: current.items.filter((item) => item.id !== id),
            total: Math.max(0, current.total - 1),
          };
        },
      );
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      if (context?.snapshots) {
        restoreQueries(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('experience') });
    },
  });
}

export function useMoveAdminExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: -1 | 1 }) => {
      const all = await listAdminExperience({
        page: 1,
        pageSize: 100,
        sort: 'sortOrder',
      });
      const ids = all.items.map((item) => item.id);
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
      await reorderAdminExperience(ids);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('experience') });
    },
  });
}
