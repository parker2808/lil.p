import { type AdminDomain, adminDomainSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const domainsApi = createAdminEntityApi<AdminDomain>(
  '/api/admin/domains',
  adminDomainSchema,
);
