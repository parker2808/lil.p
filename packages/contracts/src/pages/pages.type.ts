import type { z } from 'zod';

import type {
  adminPageListItemSchema,
  adminPageSchema,
  adminPageVersionListItemSchema,
  adminPageVersionSchema,
  createBlockSchema,
  invalidPreviewBlockSchema,
  pageSnapshotBlockSchema,
  pageSnapshotSchema,
  publicPagePreviewSchema,
  publicPageSchema,
  publicPageSeoSchema,
  publishPageSchema,
  updateBlockSchema,
  updatePageSchema,
} from './pages.schema';

export type PublicPage = z.infer<typeof publicPageSchema>;
export type PublicPageSeo = z.infer<typeof publicPageSeoSchema>;
export type PublicPagePreview = z.infer<typeof publicPagePreviewSchema>;
export type InvalidPreviewBlock = z.infer<typeof invalidPreviewBlockSchema>;
export type PageSnapshot = z.infer<typeof pageSnapshotSchema>;
export type PageSnapshotBlock = z.infer<typeof pageSnapshotBlockSchema>;
export type AdminPageListItem = z.infer<typeof adminPageListItemSchema>;
export type AdminPage = z.infer<typeof adminPageSchema>;
export type PageUpdateInput = z.infer<typeof updatePageSchema>;
export type BlockCreateInput = z.infer<typeof createBlockSchema>;
export type BlockUpdateInput = z.infer<typeof updateBlockSchema>;
export type PublishPageInput = z.infer<typeof publishPageSchema>;
export type AdminPageVersionListItem = z.infer<typeof adminPageVersionListItemSchema>;
export type AdminPageVersion = z.infer<typeof adminPageVersionSchema>;
