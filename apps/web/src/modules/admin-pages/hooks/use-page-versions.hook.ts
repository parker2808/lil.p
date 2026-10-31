'use client';

import { type AdminPage, type PageKey, qk } from '@portfolio/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  discardAdminPage,
  getAdminPageVersion,
  listAdminPageVersions,
  publishAdminPage,
  restoreAdminPage,
} from '../services/admin-pages.service';

export function usePageVersions(key: PageKey) {
  return useQuery({
    queryKey: qk.admin.pages.versions(key),
    queryFn: () => listAdminPageVersions(key),
  });
}

export function usePageVersion(key: PageKey, version: number | null) {
  return useQuery({
    queryKey: version
      ? qk.admin.pages.version(key, version)
      : ['admin', 'pages', 'version', 'idle'],
    queryFn: () => getAdminPageVersion(key, version as number),
    enabled: version !== null,
  });
}

function useInvalidatePage(key: PageKey) {
  const queryClient = useQueryClient();
  return (page?: AdminPage) => {
    if (page) {
      queryClient.setQueryData(qk.admin.pages.detail(key), page);
    }
    void queryClient.invalidateQueries({ queryKey: qk.admin.pages.list });
    void queryClient.invalidateQueries({ queryKey: qk.admin.pages.detail(key) });
    void queryClient.invalidateQueries({ queryKey: qk.admin.pages.versions(key) });
  };
}

export function usePublishPage(key: PageKey) {
  const invalidate = useInvalidatePage(key);
  return useMutation({
    mutationFn: (note?: string) => publishAdminPage(key, note ? { note } : {}),
    onSuccess: invalidate,
  });
}

export function useRestorePage(key: PageKey) {
  const invalidate = useInvalidatePage(key);
  return useMutation({
    meta: { publicCache: 'skip' },
    mutationFn: (version: number) => restoreAdminPage(key, version),
    onSuccess: invalidate,
  });
}

export function useDiscardPage(key: PageKey) {
  const invalidate = useInvalidatePage(key);
  return useMutation({
    meta: { publicCache: 'skip' },
    mutationFn: () => discardAdminPage(key),
    onSuccess: invalidate,
  });
}
