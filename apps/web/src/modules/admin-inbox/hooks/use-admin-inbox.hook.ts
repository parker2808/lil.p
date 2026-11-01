'use client';

import {
  type AdminContactMessage,
  type AdminContactMessageListPage,
  type AdminContactMessageListParams,
  CONTACT_MESSAGE_HIDDEN_STATUSES,
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

/** Mirrors the API list filter: no status filter hides spam and archived messages. */
function isListedStatus(
  status: ContactMessageStatus,
  filter: ContactMessageStatus | undefined,
): boolean {
  return filter
    ? status === filter
    : !(CONTACT_MESSAGE_HIDDEN_STATUSES as readonly string[]).includes(status);
}

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
      meta: { publicCache: 'skip' },
      // Serial, so an Undo cannot reach the API before the archive it reverts.
      scope: { id: 'admin-message-status' },
      mutationFn: ({ id, status }: { id: number; status: ContactMessageStatus }) =>
        updateAdminMessage(id, { status }),
      onMutate: async ({ id, status }) => {
        await queryClient.cancelQueries({ queryKey: qk.admin.all('messages') });
        const lists = snapshotQueries<AdminContactMessageListPage>(queryClient, [
          ...qk.admin.all('messages'),
          'list',
        ]);
        const detailKey = qk.admin.detail('messages', id);
        const detail = queryClient.getQueryData<AdminContactMessage>(detailKey);
        for (const [key, page] of lists) {
          if (!page) {
            continue;
          }
          const params = key[3] as AdminContactMessageListParams | undefined;
          const removed =
            !isListedStatus(status, params?.status) && page.items.some((item) => item.id === id);
          queryClient.setQueryData(key, {
            ...page,
            items: removed
              ? page.items.filter((item) => item.id !== id)
              : page.items.map((item) => (item.id === id ? { ...item, status } : item)),
            total: removed ? page.total - 1 : page.total,
          });
        }
        if (detail) {
          queryClient.setQueryData(detailKey, { ...detail, status });
        }
        return { lists, detail };
      },
      onError: (_error, vars, context) => {
        if (context?.lists) {
          restoreQueries(queryClient, context.lists);
        }
        if (context?.detail) {
          queryClient.setQueryData(qk.admin.detail('messages', vars.id), context.detail);
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
