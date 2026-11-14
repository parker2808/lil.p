import {
  type BlockDefinition,
  type BlockRef,
  type BlockRole,
  defineBlock,
  isBlockAllowedOnPage as isCoreBlockAllowedOnPage,
} from '@parker2808/cms-core/contracts';

import { corePageKeySchema, type PageKey } from '../pages/pages.enum';

export { defineBlock };
export type { BlockDefinition, BlockRef, BlockRole };

export function isBlockAllowedOnPage(
  definition: Pick<BlockDefinition, 'pages' | 'customPage'>,
  pageKey: PageKey,
): boolean {
  return isCoreBlockAllowedOnPage(definition, pageKey, corePageKeySchema.options);
}
