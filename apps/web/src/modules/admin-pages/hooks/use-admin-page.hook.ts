'use client';

import { type PageKey, qk } from '@portfolio/contracts';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { getAdminPage, listAdminPages } from '../services/admin-pages.service';

export function useAdminPages() {
  return useQuery({
    queryKey: qk.admin.pages.list,
    queryFn: listAdminPages,
  });
}

export function useAdminPage(key: PageKey) {
  return useSuspenseQuery({
    queryKey: qk.admin.pages.detail(key),
    queryFn: () => getAdminPage(key),
  });
}
