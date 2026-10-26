import { z } from 'zod';

import { publicBlockSchema } from '../blocks/block.schema';
import { localeSchema } from '../common/locale.schema';
import { pageKeySchema } from './pages.enum';

export const publicPageSeoSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  lang: localeSchema,
});

export const publicPageSchema = z.object({
  key: pageKeySchema,
  seo: publicPageSeoSchema,
  blocks: z.array(publicBlockSchema),
});
