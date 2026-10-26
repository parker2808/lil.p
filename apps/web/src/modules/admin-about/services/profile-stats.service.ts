import { type AdminProfileStat, adminProfileStatSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const profileStatsApi = createAdminEntityApi<AdminProfileStat>(
  '/api/admin/profile-stats',
  adminProfileStatSchema,
);
