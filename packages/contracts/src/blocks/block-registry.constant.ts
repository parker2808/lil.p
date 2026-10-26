import { z } from 'zod';

import type { BlockDefinition } from './define-block.util';
import { aboutIntroBlock } from './definitions/about-intro.block';
import { caseGridBlock } from './definitions/case-grid.block';
import { ctaBandBlock } from './definitions/cta-band.block';
import { cvDownloadBlock } from './definitions/cv-download.block';
import { domainGridBlock } from './definitions/domain-grid.block';
import { educationListBlock } from './definitions/education-list.block';
import { featuredCaseBlock } from './definitions/featured-case.block';
import { heroBlock } from './definitions/hero.block';
import { notesBrowserBlock } from './definitions/notes-browser.block';
import { pageHeaderBlock } from './definitions/page-header.block';
import { postListBlock } from './definitions/post-list.block';
import { principleListBlock } from './definitions/principle-list.block';
import { processBlock } from './definitions/process.block';
import { projectsBrowserBlock } from './definitions/projects-browser.block';
import { proseBlock } from './definitions/prose.block';
import { skillGroupsBlock } from './definitions/skill-groups.block';
import { statBandBlock } from './definitions/stat-band.block';
import { techMarqueeBlock } from './definitions/tech-marquee.block';
import { timelineBlock } from './definitions/timeline.block';

export const BLOCK_REGISTRY = {
  hero: heroBlock,
  'page-header': pageHeaderBlock,
  'cta-band': ctaBandBlock,
  'stat-band': statBandBlock,
  'tech-marquee': techMarqueeBlock,
  'featured-case': featuredCaseBlock,
  'domain-grid': domainGridBlock,
  'case-grid': caseGridBlock,
  process: processBlock,
  'skill-groups': skillGroupsBlock,
  'post-list': postListBlock,
  'about-intro': aboutIntroBlock,
  timeline: timelineBlock,
  'principle-list': principleListBlock,
  'education-list': educationListBlock,
  'cv-download': cvDownloadBlock,
  prose: proseBlock,
  'projects-browser': projectsBrowserBlock,
  'notes-browser': notesBrowserBlock,
} as const satisfies Record<string, BlockDefinition>;

export type BlockType = keyof typeof BLOCK_REGISTRY;

export const blockTypeSchema = z.enum(Object.keys(BLOCK_REGISTRY) as [BlockType, ...BlockType[]]);
