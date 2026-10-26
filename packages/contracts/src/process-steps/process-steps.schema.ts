import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { iconKeySchema } from '../constants/icons.constant';

export const publicProcessStepSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  caption: z.string(),
  iconKey: iconKeySchema,
  lang: localeSchema,
});
