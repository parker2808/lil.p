'use client';

import { qk } from '@portfolio/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminProject,
  getAdminProject,
  updateAdminProject,
} from '../services/admin-projects.service';

export function useAdminProject(id: number | null) {
  return useQuery({
    queryKey: id === null ? ['admin', 'projects', 'new'] : qk.admin.detail('projects', id),
    queryFn: () => getAdminProject(id as number),
    enabled: id !== null,
  });
}

export function useCreateAdminProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminProject,
    onSuccess: (project) => {
      queryClient.setQueryData(qk.admin.detail('projects', project.id), project);
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('projects') });
    },
  });
}

export function useSaveAdminProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateAdminProject>[1] }) =>
      updateAdminProject(id, body),
    onSuccess: (project) => {
      queryClient.setQueryData(qk.admin.detail('projects', project.id), project);
      void queryClient.invalidateQueries({ queryKey: qk.admin.all('projects') });
    },
  });
}
