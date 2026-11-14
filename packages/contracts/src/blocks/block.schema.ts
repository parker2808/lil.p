import {
  adminBlockSchema,
  blockKeySchema,
  publicBlockSchema as corePublicBlockSchema,
} from '@parker2808/cms-core/contracts';

import { blockTypeSchema } from './block-registry.constant';

export { adminBlockSchema, blockKeySchema };
export const publicBlockSchema = corePublicBlockSchema.extend({ type: blockTypeSchema });
