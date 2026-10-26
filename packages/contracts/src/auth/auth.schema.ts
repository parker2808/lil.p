import { z } from 'zod';

import { roleSchema } from './auth.enum';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const meSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string(),
  role: roleSchema,
});
