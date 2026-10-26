import { type AdminProcessStep, adminProcessStepSchema } from '@portfolio/contracts';

import { createAdminEntityApi } from '@/modules/admin-core/services/small-entity.service';

export const processStepsApi = createAdminEntityApi<AdminProcessStep>(
  '/api/admin/process-steps',
  adminProcessStepSchema,
);
