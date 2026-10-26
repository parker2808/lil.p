'use client';

import { type AdminPostListPage, type AdminPostListParams, qk } from '@portfolio/contracts';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { restoreQueries, snapshotQueries } from '@/modules/admin-core/utils/optimistic.util';

import { archiveAdminPost, getAdminPost, listAdminPosts } from '../services/admin-posts.service';

export function useAdminPosts(params: AdminPostListParams) {
  return useQuery({
    queryKey: qk.admin.list('posts', params),
    queryFn: () => listAdminPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function usePrefetchAdminPost() {
  const queryClient = useQueryClient();
  const timers = useRef<Map<number, number>>(new Map());

  return {
    prefetch(id: number) {
      window.clearTimeout(timers.current.get(id));
      const timer = window.setTimeout(() => {
        void queryClient.prefetchQuery({
          queryKey: qk.admin.detail('posts', id),
          queryFn: () => getAdminPost(id),
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

export function useArchiveAdminPost(params: AdminPostListParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => archiveAdminPost(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.admin.all('posts') });
      const snapshots = snapshotQueries<AdminPostListPage>(
        queryClient,
        qk.admin.list('posts', params),
      );
      queryClient.setQueryData<AdminPostListPage>(qk.admin.list('posts', params), (current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          items: current.items.filter((item) => item.id !== id),
          total: Math.max(0, current.total - 1),
        };
      });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      if (context?.snapshots) {
        restoreQueries(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('posts') });
    },
  });
}
