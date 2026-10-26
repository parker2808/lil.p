import type { z } from 'zod';

import type {
  adminUserListPageSchema,
  adminUserListParamsSchema,
  adminUserSchema,
  createUserSchema,
  setPasswordSchema,
  updateUserSchema,
} from './users.schema';

export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminUserListParams = z.infer<typeof adminUserListParamsSchema>;
export type AdminUserListPage = z.infer<typeof adminUserListPageSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
