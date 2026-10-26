import { z } from 'zod';

import type { BlockDefinition } from './define-block.util';
import { ctaBandBlock } from './definitions/cta-band.block';
import { heroBlock } from './definitions/hero.block';
import { pageHeaderBlock } from './definitions/page-header.block';

export const BLOCK_REGISTRY = {
  hero: heroBlock,
  'page-header': pageHeaderBlock,
  'cta-band': ctaBandBlock,
} as const satisfies Record<string, BlockDefinition>;

export type BlockType = keyof typeof BLOCK_REGISTRY;

export const blockTypeSchema = z.enum(Object.keys(BLOCK_REGISTRY) as [BlockType, ...BlockType[]]);
