import type { z } from 'zod';

import type { publicTagSchema } from './tags.schema';

export type PublicTag = z.infer<typeof publicTagSchema>;
