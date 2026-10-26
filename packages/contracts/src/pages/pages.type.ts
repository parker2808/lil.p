import type { z } from 'zod';

import type {
  adminPageListItemSchema,
  adminPageSchema,
  createBlockSchema,
  publicPageSchema,
  publicPageSeoSchema,
  updateBlockSchema,
  updatePageSchema,
} from './pages.schema';

export type PublicPage = z.infer<typeof publicPageSchema>;
export type PublicPageSeo = z.infer<typeof publicPageSeoSchema>;
export type AdminPageListItem = z.infer<typeof adminPageListItemSchema>;
export type AdminPage = z.infer<typeof adminPageSchema>;
export type PageUpdateInput = z.infer<typeof updatePageSchema>;
export type BlockCreateInput = z.infer<typeof createBlockSchema>;
export type BlockUpdateInput = z.infer<typeof updateBlockSchema>;
