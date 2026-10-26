'use client';

import { qk } from '@portfolio/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAdminSite, updateAdminSite } from '../services/site.service';

export function useAdminSite() {
  return useQuery({
    queryKey: qk.admin.all('site'),
    queryFn: getAdminSite,
  });
}

export function useSaveAdminSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSite,
    onSuccess: (site) => {
      queryClient.setQueryData(qk.admin.all('site'), site);
    },
  });
}
