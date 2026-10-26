import { type AdminSocialLink, adminSocialLinkSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const socialLinksApi = createAdminEntityApi<AdminSocialLink>(
  '/api/admin/social-links',
  adminSocialLinkSchema,
);
