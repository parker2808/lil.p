import type { z } from 'zod';

import type { publicNavItemSchema } from './navigation.schema';

export type PublicNavItem = z.infer<typeof publicNavItemSchema>;
