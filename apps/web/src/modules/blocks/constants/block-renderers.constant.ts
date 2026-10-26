import type { BlockType, PublicBlock } from '@portfolio/contracts';
import type { ComponentType, ReactNode } from 'react';

import { CtaBandBlock, CtaBandSkeleton } from '../components/CtaBandBlock/CtaBandBlock';
import { HeroBlock, HeroSkeleton } from '../components/HeroBlock/HeroBlock';
import { PageHeaderBlock, PageHeaderSkeleton } from '../components/PageHeaderBlock/PageHeaderBlock';
import type { BlockContext } from '../types/entities/block-context.type';

export type BlockRendererEntry = {
  component: ComponentType<{ block: PublicBlock; context: BlockContext }>;
  skeleton: ComponentType;
};

export const BLOCK_RENDERERS = {
  hero: { component: HeroBlock, skeleton: HeroSkeleton },
  'page-header': { component: PageHeaderBlock, skeleton: PageHeaderSkeleton },
  'cta-band': { component: CtaBandBlock, skeleton: CtaBandSkeleton },
} satisfies Record<BlockType, BlockRendererEntry>;

export type BlockRenderers = Record<string, BlockRendererEntry | undefined>;

export function BlockFallback({ children }: { children?: ReactNode }) {
  return children ?? null;
}
