import { type AdminContactTopic, adminContactTopicSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const contactTopicsApi = createAdminEntityApi<AdminContactTopic>(
  '/api/admin/contact-topics',
  adminContactTopicSchema,
);
