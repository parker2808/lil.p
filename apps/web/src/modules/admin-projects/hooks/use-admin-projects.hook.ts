'use client';

import {
  type AdminProjectListItem,
  type AdminProjectListPage,
  type AdminProjectListParams,
  qk,
} from '@portfolio/contracts';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { restoreQueries, snapshotQueries } from '@/modules/admin-core/utils/optimistic.util';

import {
  archiveAdminProject,
  getAdminProject,
  listAdminProjects,
  reorderAdminProjects,
  updateAdminProject,
} from '../services/admin-projects.service';

export function useAdminProjects(params: AdminProjectListParams) {
  return useQuery({
    queryKey: qk.admin.list('projects', params),
    queryFn: () => listAdminProjects(params),
    placeholderData: keepPreviousData,
  });
}

export function usePrefetchAdminProject() {
  const queryClient = useQueryClient();
  const timers = useRef<Map<number, number>>(new Map());

  return {
    prefetch(id: number) {
      window.clearTimeout(timers.current.get(id));
      const timer = window.setTimeout(() => {
        void queryClient.prefetchQuery({
          queryKey: qk.admin.detail('projects', id),
          queryFn: () => getAdminProject(id),
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

export function useArchiveAdminProject(params: AdminProjectListParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => archiveAdminProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.admin.all('projects') });
      const snapshots = snapshotQueries<AdminProjectListPage>(
        queryClient,
        qk.admin.list('projects', params),
      );
      queryClient.setQueryData<AdminProjectListPage>(
        qk.admin.list('projects', params),
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
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('projects') });
    },
  });
}

export function useToggleProjectStatus(params: AdminProjectListParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: AdminProjectListItem) =>
      updateAdminProject(item.id, {
        status: item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
        updatedAt: item.updatedAt,
      }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.list('projects', params) });
    },
  });
}

export function useMoveAdminProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: -1 | 1 }) => {
      const all = await listAdminProjects({
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
      await reorderAdminProjects(ids);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('projects') });
    },
  });
}
