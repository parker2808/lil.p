import type { BlockType, PublicBlock } from '@portfolio/contracts';
import type { ComponentType, ReactNode } from 'react';

import { AboutIntroBlock, AboutIntroSkeleton } from '../components/AboutIntroBlock/AboutIntroBlock';
import { CaseGridBlock, CaseGridSkeleton } from '../components/CaseGridBlock/CaseGridBlock';
import {
  ContactFormBlock,
  ContactFormSkeleton,
} from '../components/ContactFormBlock/ContactFormBlock';
import { CtaBandBlock, CtaBandSkeleton } from '../components/CtaBandBlock/CtaBandBlock';
import { CvDownloadBlock, CvDownloadSkeleton } from '../components/CvDownloadBlock/CvDownloadBlock';
import { DomainGridBlock, DomainGridSkeleton } from '../components/DomainGridBlock/DomainGridBlock';
import {
  EducationListBlock,
  EducationListSkeleton,
} from '../components/EducationListBlock/EducationListBlock';
import {
  FeaturedCaseBlock,
  FeaturedCaseSkeleton,
} from '../components/FeaturedCaseBlock/FeaturedCaseBlock';
import { HeroBlock, HeroSkeleton } from '../components/HeroBlock/HeroBlock';
import {
  NotesBrowserBlock,
  NotesBrowserSkeleton,
} from '../components/NotesBrowserBlock/NotesBrowserBlock';
import { PageHeaderBlock, PageHeaderSkeleton } from '../components/PageHeaderBlock/PageHeaderBlock';
import { PostListBlock, PostListSkeleton } from '../components/PostListBlock/PostListBlock';
import {
  PrincipleListBlock,
  PrincipleListSkeleton,
} from '../components/PrincipleListBlock/PrincipleListBlock';
import { ProcessBlock, ProcessSkeleton } from '../components/ProcessBlock/ProcessBlock';
import {
  ProjectsBrowserBlock,
  ProjectsBrowserSkeleton,
} from '../components/ProjectsBrowserBlock/ProjectsBrowserBlock';
import { ProseBlock, ProseSkeleton } from '../components/ProseBlock/ProseBlock';
import {
  SkillGroupsBlock,
  SkillGroupsSkeleton,
} from '../components/SkillGroupsBlock/SkillGroupsBlock';
import { StatBandBlock, StatBandSkeleton } from '../components/StatBandBlock/StatBandBlock';
import {
  TechMarqueeBlock,
  TechMarqueeSkeleton,
} from '../components/TechMarqueeBlock/TechMarqueeBlock';
import { TimelineBlock, TimelineSkeleton } from '../components/TimelineBlock/TimelineBlock';
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
  'about-intro': { component: AboutIntroBlock, skeleton: AboutIntroSkeleton },
  timeline: { component: TimelineBlock, skeleton: TimelineSkeleton },
  'principle-list': { component: PrincipleListBlock, skeleton: PrincipleListSkeleton },
  'education-list': { component: EducationListBlock, skeleton: EducationListSkeleton },
  'cv-download': { component: CvDownloadBlock, skeleton: CvDownloadSkeleton },
  prose: { component: ProseBlock, skeleton: ProseSkeleton },
  'projects-browser': { component: ProjectsBrowserBlock, skeleton: ProjectsBrowserSkeleton },
  'notes-browser': { component: NotesBrowserBlock, skeleton: NotesBrowserSkeleton },
  'contact-form': { component: ContactFormBlock, skeleton: ContactFormSkeleton },
} satisfies Record<BlockType, BlockRendererEntry>;

export type BlockRenderers = Record<string, BlockRendererEntry | undefined>;

export function BlockFallback({ children }: { children?: ReactNode }) {
  return children ?? null;
}
