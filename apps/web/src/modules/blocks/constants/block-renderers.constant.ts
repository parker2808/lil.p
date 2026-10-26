import type { BlockType, PublicBlock } from '@portfolio/contracts';
import type { ComponentType, ReactNode } from 'react';

import { CaseGridBlock, CaseGridSkeleton } from '../components/CaseGridBlock/CaseGridBlock';
import { CtaBandBlock, CtaBandSkeleton } from '../components/CtaBandBlock/CtaBandBlock';
import { DomainGridBlock, DomainGridSkeleton } from '../components/DomainGridBlock/DomainGridBlock';
import {
  FeaturedCaseBlock,
  FeaturedCaseSkeleton,
} from '../components/FeaturedCaseBlock/FeaturedCaseBlock';
import { HeroBlock, HeroSkeleton } from '../components/HeroBlock/HeroBlock';
import { PageHeaderBlock, PageHeaderSkeleton } from '../components/PageHeaderBlock/PageHeaderBlock';
import { PostListBlock, PostListSkeleton } from '../components/PostListBlock/PostListBlock';
import { ProcessBlock, ProcessSkeleton } from '../components/ProcessBlock/ProcessBlock';
import {
  SkillGroupsBlock,
  SkillGroupsSkeleton,
} from '../components/SkillGroupsBlock/SkillGroupsBlock';
import { StatBandBlock, StatBandSkeleton } from '../components/StatBandBlock/StatBandBlock';
import {
  TechMarqueeBlock,
  TechMarqueeSkeleton,
} from '../components/TechMarqueeBlock/TechMarqueeBlock';
import type { BlockContext } from '../types/entities/block-context.type';

export type BlockRendererEntry = {
  component: ComponentType<{ block: PublicBlock; context: BlockContext }>;
  skeleton: ComponentType;
};

export const BLOCK_RENDERERS = {
  hero: { component: HeroBlock, skeleton: HeroSkeleton },
  'page-header': { component: PageHeaderBlock, skeleton: PageHeaderSkeleton },
  'cta-band': { component: CtaBandBlock, skeleton: CtaBandSkeleton },
  'stat-band': { component: StatBandBlock, skeleton: StatBandSkeleton },
  'tech-marquee': { component: TechMarqueeBlock, skeleton: TechMarqueeSkeleton },
  'featured-case': { component: FeaturedCaseBlock, skeleton: FeaturedCaseSkeleton },
  'domain-grid': { component: DomainGridBlock, skeleton: DomainGridSkeleton },
  'case-grid': { component: CaseGridBlock, skeleton: CaseGridSkeleton },
  process: { component: ProcessBlock, skeleton: ProcessSkeleton },
  'skill-groups': { component: SkillGroupsBlock, skeleton: SkillGroupsSkeleton },
  'post-list': { component: PostListBlock, skeleton: PostListSkeleton },
} satisfies Record<BlockType, BlockRendererEntry>;

export type BlockRenderers = Record<string, BlockRendererEntry | undefined>;

export function BlockFallback({ children }: { children?: ReactNode }) {
  return children ?? null;
}
