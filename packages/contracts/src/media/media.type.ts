import type { z } from 'zod';

import type {
  adminMediaListPageSchema,
  adminMediaListParamsSchema,
  adminMediaSchema,
  adminProjectImageInputSchema,
  adminProjectImageSchema,
  publicFileSchema,
  publicImageSchema,
  updateMediaSchema,
} from './media.schema';

export type PublicImage = z.infer<typeof publicImageSchema>;
export type PublicFile = z.infer<typeof publicFileSchema>;
export type AdminMedia = z.infer<typeof adminMediaSchema>;
export type AdminMediaListParams = z.infer<typeof adminMediaListParamsSchema>;
export type AdminMediaListPage = z.infer<typeof adminMediaListPageSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type AdminProjectImage = z.infer<typeof adminProjectImageSchema>;
export type AdminProjectImageInput = z.infer<typeof adminProjectImageInputSchema>;
