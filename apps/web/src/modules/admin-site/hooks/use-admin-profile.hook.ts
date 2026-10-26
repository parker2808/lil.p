'use client';

import { qk } from '@portfolio/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAdminProfile, updateAdminProfile } from '../services/profile.service';

export function useAdminProfile() {
  return useQuery({
    queryKey: qk.admin.all('profile'),
    queryFn: getAdminProfile,
  });
}

export function useSaveAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(qk.admin.all('profile'), profile);
    },
  });
}
