import type { z } from 'zod';

import type {
  adminProcessStepSchema,
  processStepCreateSchema,
  processStepUpdateSchema,
  publicProcessStepSchema,
} from './process-steps.schema';

export type PublicProcessStep = z.infer<typeof publicProcessStepSchema>;
export type ProcessStepCreateInput = z.infer<typeof processStepCreateSchema>;
export type ProcessStepUpdateInput = z.infer<typeof processStepUpdateSchema>;
export type AdminProcessStep = z.infer<typeof adminProcessStepSchema>;
