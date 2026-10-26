import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { iconKeySchema } from '../constants/icons.constant';
import { statSourceSchema } from './profile-stats.enum';

export const publicProfileStatSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  value: z.string(),
  suffix: z.string().nullable(),
  source: statSourceSchema,
  iconKey: iconKeySchema,
  lang: localeSchema,
});
