'use client';

import { qk } from '@portfolio/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminPost,
  getAdminPost,
  publishAdminPost,
  unpublishAdminPost,
  updateAdminPost,
} from '../services/admin-posts.service';

export function useAdminPost(id: number | null) {
  return useQuery({
    queryKey: id === null ? ['admin', 'posts', 'new'] : qk.admin.detail('posts', id),
    queryFn: () => getAdminPost(id as number),
    enabled: id !== null,
  });
}

export function useCreateAdminPost() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { publicCache: 'unless-draft' },
    mutationFn: createAdminPost,
    onSuccess: (post) => {
      queryClient.setQueryData(qk.admin.detail('posts', post.id), post);
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('posts') });
    },
  });
}

export function useSaveAdminPost() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { publicCache: 'unless-draft' },
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateAdminPost>[1] }) =>
      updateAdminPost(id, body),
    onSuccess: (post) => {
      queryClient.setQueryData(qk.admin.detail('posts', post.id), post);
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('posts') });
    },
  });
}

export function usePublishAdminPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishAdminPost,
    onSuccess: (post) => {
      queryClient.setQueryData(qk.admin.detail('posts', post.id), post);
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('posts') });
    },
  });
}

export function useUnpublishAdminPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unpublishAdminPost,
    onSuccess: (post) => {
      queryClient.setQueryData(qk.admin.detail('posts', post.id), post);
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('posts') });
    },
  });
}
