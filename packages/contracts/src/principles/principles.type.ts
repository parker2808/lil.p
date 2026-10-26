import type { z } from 'zod';

import type { publicPrincipleSchema } from './principles.schema';

export type PublicPrinciple = z.infer<typeof publicPrincipleSchema>;
