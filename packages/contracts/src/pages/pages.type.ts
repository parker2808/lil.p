import type { z } from 'zod';

import type { publicPageSchema, publicPageSeoSchema } from './pages.schema';

export type PublicPage = z.infer<typeof publicPageSchema>;
export type PublicPageSeo = z.infer<typeof publicPageSeoSchema>;
