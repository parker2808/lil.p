'use client';

import { qk } from '@portfolio/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminExperience,
  getAdminExperience,
  updateAdminExperience,
} from '../services/experience.service';

export function useAdminExperienceRow(id: number | null) {
  return useQuery({
    queryKey: id === null ? ['admin', 'experience', 'new'] : qk.admin.detail('experience', id),
    queryFn: () => getAdminExperience(id as number),
    enabled: id !== null,
  });
}

export function useCreateAdminExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminExperience,
    onSuccess: (row) => {
      queryClient.setQueryData(qk.admin.detail('experience', row.id), row);
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('experience') });
    },
  });
}

export function useSaveAdminExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateAdminExperience>[1] }) =>
      updateAdminExperience(id, body),
    onSuccess: (row) => {
      queryClient.setQueryData(qk.admin.detail('experience', row.id), row);
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('experience') });
    },
  });
}
