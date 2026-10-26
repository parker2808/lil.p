import { type AdminEducation, adminEducationSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const educationApi = createAdminEntityApi<AdminEducation>(
  '/api/admin/education',
  adminEducationSchema,
);
