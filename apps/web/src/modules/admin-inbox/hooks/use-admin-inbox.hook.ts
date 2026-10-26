'use client';

import {
  type AdminContactMessageListPage,
  type AdminContactMessageListParams,
  type ContactMessageStatus,
  qk,
} from '@portfolio/contracts';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { restoreQueries, snapshotQueries } from '@/modules/admin-core/utils/optimistic.util';

import {
  getAdminMessage,
  listAdminMessages,
  updateAdminMessage,
} from '../services/admin-inbox.service';

export function useAdminMessages(params: AdminContactMessageListParams) {
  return useQuery({
    queryKey: qk.admin.list('messages', params),
    queryFn: () => listAdminMessages(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminMessage(id: number) {
  return useQuery({
    queryKey: qk.admin.detail('messages', id),
    queryFn: () => getAdminMessage(id),
  });
}

export function useInboxMutations() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.inbox');

  return {
    setStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: ContactMessageStatus }) =>
        updateAdminMessage(id, { status }),
      onMutate: async ({ id, status }) => {
        await queryClient.cancelQueries({ queryKey: qk.admin.all('messages') });
        const lists = snapshotQueries<AdminContactMessageListPage>(
          queryClient,
          qk.admin.all('messages'),
        );
        for (const [key, page] of lists) {
          if (!page) {
            continue;
          }
          queryClient.setQueryData(key, {
            ...page,
            items: page.items.map((item) => (item.id === id ? { ...item, status } : item)),
          });
        }
        return { lists };
      },
      onError: (_error, _vars, context) => {
        if (context?.lists) {
          restoreQueries(queryClient, context.lists);
        }
        toast.error(t('updateError'));
      },
      onSettled: async (_data, _error, vars) => {
        await queryClient.invalidateQueries({ queryKey: qk.admin.all('messages') });
        await queryClient.invalidateQueries({ queryKey: qk.admin.detail('messages', vars.id) });
        await queryClient.invalidateQueries({ queryKey: qk.admin.inbox.unread });
        await queryClient.invalidateQueries({ queryKey: qk.admin.stats('30d') });
      },
    }),
  };
}
