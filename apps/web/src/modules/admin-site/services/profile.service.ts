import {
  type AdminProfile,
  adminProfileSchema,
  type ProfileUpdateInput,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

export function getAdminProfile(): Promise<AdminProfile> {
  return apiClient<AdminProfile>('/api/admin/profile').then((data) =>
    adminProfileSchema.parse(data),
  );
}

export function updateAdminProfile(body: ProfileUpdateInput): Promise<AdminProfile> {
  return apiClient<AdminProfile>('/api/admin/profile', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminProfileSchema.parse(data));
}
