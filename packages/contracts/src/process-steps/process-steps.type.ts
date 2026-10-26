import type { z } from 'zod';

import type { publicProcessStepSchema } from './process-steps.schema';

export type PublicProcessStep = z.infer<typeof publicProcessStepSchema>;
