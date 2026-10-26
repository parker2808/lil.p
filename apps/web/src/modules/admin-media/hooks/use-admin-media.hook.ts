'use client';

import { type AdminMedia, qk } from '@portfolio/contracts';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  listAdminMedia,
  removeAdminMedia,
  updateAdminMedia,
} from '../services/admin-media.service';

export function useAdminMediaList() {
  return useInfiniteQuery({
    queryKey: qk.admin.media.all,
    queryFn: ({ pageParam }) => listAdminMedia(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useAdminMediaMutations() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.media');

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: qk.admin.media.all });
    void queryClient.invalidateQueries({ queryKey: qk.admin.health });
  };

  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { altEn?: string; altVi?: string } }) =>
      updateAdminMedia(id, body),
    onSuccess: () => {
      invalidate();
    },
    onError: () => toast.error(t('updateError')),
  });

  const remove = useMutation({
    mutationFn: (id: number) => removeAdminMedia(id),
    onSuccess: () => {
      invalidate();
    },
    onError: () => toast.error(t('inUse')),
  });

  return { update, remove };
}

export function flattenMediaPages(pages: { items: AdminMedia[] }[] | undefined): AdminMedia[] {
  return pages?.flatMap((page) => page.items) ?? [];
}
