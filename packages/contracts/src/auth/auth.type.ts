import type { z } from 'zod';

import type { changePasswordSchema, loginSchema, meSchema } from './auth.schema';

export type LoginInput = z.infer<typeof loginSchema>;
export type Me = z.infer<typeof meSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
