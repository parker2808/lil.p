import { type AdminNavItem, adminNavItemSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const navigationApi = createAdminEntityApi<AdminNavItem>(
  '/api/admin/navigation',
  adminNavItemSchema,
);
