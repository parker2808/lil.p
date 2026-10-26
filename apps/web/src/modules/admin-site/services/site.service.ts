import {
  type AdminSiteSettings,
  adminSiteSettingsSchema,
  type SiteSettingsUpdateInput,
} from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

export function getAdminSite(): Promise<AdminSiteSettings> {
  return apiClient<AdminSiteSettings>('/api/admin/site').then((data) =>
    adminSiteSettingsSchema.parse(data),
  );
}

export function updateAdminSite(body: SiteSettingsUpdateInput): Promise<AdminSiteSettings> {
  return apiClient<AdminSiteSettings>('/api/admin/site', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => adminSiteSettingsSchema.parse(data));
}
