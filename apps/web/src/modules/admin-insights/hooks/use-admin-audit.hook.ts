'use client';

import {
  type AdminAuditListPage,
  type AdminAuditListParams,
  type AdminProjectListItem,
  type AdminPostListItem,
  qk,
} from '@portfolio/contracts';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bulkAdminPosts, bulkAdminProjects, listAdminAudit } from '../services/admin-audit.service';

export function useAdminAudit(params: AdminAuditListParams) {
  return useQuery({
    queryKey: qk.admin.audit(params),
    queryFn: () => listAdminAudit(params),
  });
}

export function useAdminAuditInfinite(params: Omit<AdminAuditListParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: qk.admin.audit(params),
    queryFn: ({ pageParam }) => listAdminAudit({ ...params, cursor: pageParam }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function flattenAuditPages(pages: AdminAuditListPage[] | undefined) {
  return pages?.flatMap((page) => page.items) ?? [];
}

export function useBulkArchiveProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: AdminProjectListItem[]) =>
      bulkAdminProjects(
        rows.map((row) => row.id),
        'archive',
      ),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('projects') });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
    },
  });
}

export function useBulkArchivePosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: AdminPostListItem[]) =>
      bulkAdminPosts(
        rows.map((row) => row.id),
        'archive',
      ),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('posts') });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
    },
  });
}
