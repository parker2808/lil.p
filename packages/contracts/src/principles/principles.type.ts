import type { z } from 'zod';

import type {
  adminPrincipleSchema,
  principleCreateSchema,
  principleUpdateSchema,
  publicPrincipleSchema,
} from './principles.schema';

export type PublicPrinciple = z.infer<typeof publicPrincipleSchema>;
export type PrincipleCreateInput = z.infer<typeof principleCreateSchema>;
export type PrincipleUpdateInput = z.infer<typeof principleUpdateSchema>;
export type AdminPrinciple = z.infer<typeof adminPrincipleSchema>;
