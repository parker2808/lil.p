import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { iconKeySchema } from '../constants/icons.constant';

export const publicPrincipleSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  body: z.string(),
  iconKey: iconKeySchema,
  lang: localeSchema,
});
