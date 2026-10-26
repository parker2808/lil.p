import type { z } from 'zod';

import type {
  adminNavItemSchema,
  navItemCreateSchema,
  navItemUpdateSchema,
  publicNavItemSchema,
} from './navigation.schema';

export type PublicNavItem = z.infer<typeof publicNavItemSchema>;
export type NavItemCreateInput = z.infer<typeof navItemCreateSchema>;
export type NavItemUpdateInput = z.infer<typeof navItemUpdateSchema>;
export type AdminNavItem = z.infer<typeof adminNavItemSchema>;
