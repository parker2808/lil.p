import { type AdminPrinciple, adminPrincipleSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const principlesApi = createAdminEntityApi<AdminPrinciple>(
  '/api/admin/principles',
  adminPrincipleSchema,
);
