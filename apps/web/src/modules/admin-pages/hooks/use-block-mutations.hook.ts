'use client';

import {
  type AdminPage,
  type BlockCreateInput,
  type BlockUpdateInput,
  type PageKey,
  qk,
} from '@portfolio/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { restoreQueries, snapshotQueries } from '@/modules/admin-core/utils/optimistic.util';

import {
  createAdminBlock,
  deleteAdminBlock,
  duplicateAdminBlock,
  reorderAdminBlocks,
  updateAdminBlock,
  updateAdminPage,
} from '../services/admin-pages.service';

export function useBlockMutations(key: PageKey, labels: { reorderFailed: string }) {
  const queryClient = useQueryClient();
  const detailKey = qk.admin.pages.detail(key);

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: qk.admin.pages.list });
    void queryClient.invalidateQueries({ queryKey: detailKey });
  }

  const add = useMutation({
    mutationFn: (body: BlockCreateInput) => createAdminBlock(key, body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: BlockUpdateInput }) =>
      updateAdminBlock(key, id, body),
    onSuccess: invalidate,
  });

  const duplicate = useMutation({
    mutationFn: (id: number) => duplicateAdminBlock(key, id),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteAdminBlock(key, id),
    onSuccess: invalidate,
  });

  const toggle = useMutation({
    mutationFn: ({
      id,
      isVisible,
      updatedAt,
    }: {
      id: number;
      isVisible: boolean;
      updatedAt: string;
    }) => updateAdminBlock(key, id, { isVisible, updatedAt }),
    onMutate: async ({ id, isVisible }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const snapshots = snapshotQueries<AdminPage>(queryClient, detailKey);
      queryClient.setQueryData<AdminPage>(detailKey, (current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          blocks: current.blocks.map((block) =>
            block.id === id ? { ...block, isVisible } : block,
          ),
        };
      });
      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (context?.snapshots) {
        restoreQueries(queryClient, context.snapshots);
      }
    },
    onSettled: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (ids: number[]) => reorderAdminBlocks(key, ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const snapshots = snapshotQueries<AdminPage>(queryClient, detailKey);
      queryClient.setQueryData<AdminPage>(detailKey, (current) => {
        if (!current) {
          return current;
        }
        const byId = new Map(current.blocks.map((block) => [block.id, block]));
        return {
          ...current,
          blocks: ids
            .map((id, sortOrder) => {
              const block = byId.get(id);
              return block ? { ...block, sortOrder } : null;
            })
            .filter((block): block is NonNullable<typeof block> => block !== null),
        };
      });
      return { snapshots };
    },
    onError: (_error, _ids, context) => {
      if (context?.snapshots) {
        restoreQueries(queryClient, context.snapshots);
      }
      toast.error(labels.reorderFailed);
    },
    onSettled: invalidate,
  });

  const savePage = useMutation({
    mutationFn: updateAdminPage.bind(null, key),
    onSuccess: (page) => {
      queryClient.setQueryData(detailKey, page);
      void queryClient.invalidateQueries({ queryKey: qk.admin.pages.list });
    },
  });

  return { add, update, duplicate, remove, toggle, reorder, savePage };
}
