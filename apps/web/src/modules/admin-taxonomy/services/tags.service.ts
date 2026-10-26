import { type AdminTag, adminTagSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const tagsApi = createAdminEntityApi<AdminTag>('/api/admin/tags', adminTagSchema);
