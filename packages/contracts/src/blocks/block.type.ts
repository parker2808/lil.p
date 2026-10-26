import type { z } from 'zod';

import type { adminBlockSchema, publicBlockSchema } from './block.schema';
import type { BlockType } from './block-registry.constant';

export type AdminBlock = z.infer<typeof adminBlockSchema>;
export type PublicBlock = z.infer<typeof publicBlockSchema>;
export type { BlockType };
