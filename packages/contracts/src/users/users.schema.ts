import { z } from 'zod';

import { roleSchema } from '../auth/auth.enum';
import { listParamsSchema, paginatedSchema } from '../common/list-params.schema';

export const adminUserSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string(),
  role: roleSchema,
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable(),
  updatedAt: z.string(),
});

export const adminUserListParamsSchema = listParamsSchema([
  'name',
  '-name',
  'email',
  '-email',
  'lastLoginAt',
  '-lastLoginAt',
]);

export const adminUserListPageSchema = paginatedSchema(adminUserSchema);

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(80),
  role: roleSchema,
  password: z.string().min(12),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
});

export const setPasswordSchema = z.object({
  password: z.string().min(12),
});
