'use client';

import { type AdminUserListParams, qk } from '@portfolio/contracts';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminUser,
  listAdminUsers,
  setAdminUserPassword,
  signOutAdminUser,
  updateAdminUser,
} from '../services/admin-users.service';

export function useAdminUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: qk.admin.list('users', params),
    queryFn: () => listAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: qk.admin.all('users') });
  }

  return {
    create: useMutation({
      meta: { publicCache: 'skip' },
      mutationFn: createAdminUser,
      onSuccess: invalidate,
    }),
    update: useMutation({
      meta: { publicCache: 'skip' },
      mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateAdminUser>[1] }) =>
        updateAdminUser(id, body),
      onSuccess: invalidate,
    }),
    signOut: useMutation({
      meta: { publicCache: 'skip' },
      mutationFn: signOutAdminUser,
    }),
    setPassword: useMutation({
      meta: { publicCache: 'skip' },
      mutationFn: ({ id, password }: { id: number; password: string }) =>
        setAdminUserPassword(id, { password }),
    }),
  };
}
