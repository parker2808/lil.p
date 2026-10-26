import type { z } from 'zod';

import type { loginSchema, meSchema } from './auth.schema';

export type LoginInput = z.infer<typeof loginSchema>;
export type Me = z.infer<typeof meSchema>;
