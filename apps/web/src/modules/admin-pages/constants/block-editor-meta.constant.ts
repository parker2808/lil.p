import type { BlockType, IconKey } from '@portfolio/contracts';

export const BLOCK_EDITOR_META = {
  hero: {
    icon: 'sparkles',
    labelKey: 'admin.pages.types.hero',
    descriptionKey: 'admin.pages.types.heroHint',
  },
  'page-header': {
    icon: 'book-open',
    labelKey: 'admin.pages.types.pageHeader',
    descriptionKey: 'admin.pages.types.pageHeaderHint',
  },
  'cta-band': {
    icon: 'mail',
    labelKey: 'admin.pages.types.ctaBand',
    descriptionKey: 'admin.pages.types.ctaBandHint',
  },
  'stat-band': {
    icon: 'trophy',
    labelKey: 'admin.pages.types.statBand',
    descriptionKey: 'admin.pages.types.statBandHint',
  },
  'tech-marquee': {
    icon: 'cpu',
    labelKey: 'admin.pages.types.techMarquee',
    descriptionKey: 'admin.pages.types.techMarqueeHint',
  },
  'featured-case': {
    icon: 'star',
    labelKey: 'admin.pages.types.featuredCase',
    descriptionKey: 'admin.pages.types.featuredCaseHint',
  },
  'domain-grid': {
    icon: 'boxes',
    labelKey: 'admin.pages.types.domainGrid',
    descriptionKey: 'admin.pages.types.domainGridHint',
  },
  'case-grid': {
    icon: 'briefcase',
    labelKey: 'admin.pages.types.caseGrid',
    descriptionKey: 'admin.pages.types.caseGridHint',
  },
  process: {
    icon: 'workflow',
    labelKey: 'admin.pages.types.process',
    descriptionKey: 'admin.pages.types.processHint',
  },
  'skill-groups': {
    icon: 'layers',
    labelKey: 'admin.pages.types.skillGroups',
    descriptionKey: 'admin.pages.types.skillGroupsHint',
  },
  'post-list': {
    icon: 'file-check',
    labelKey: 'admin.pages.types.postList',
    descriptionKey: 'admin.pages.types.postListHint',
  },
  'about-intro': {
    icon: 'users',
    labelKey: 'admin.pages.types.aboutIntro',
    descriptionKey: 'admin.pages.types.aboutIntroHint',
  },
  timeline: {
    icon: 'clock',
    labelKey: 'admin.pages.types.timeline',
    descriptionKey: 'admin.pages.types.timelineHint',
  },
  'principle-list': {
    icon: 'compass',
    labelKey: 'admin.pages.types.principleList',
    descriptionKey: 'admin.pages.types.principleListHint',
  },
  'education-list': {
    icon: 'graduation-cap',
    labelKey: 'admin.pages.types.educationList',
    descriptionKey: 'admin.pages.types.educationListHint',
  },
  'cv-download': {
    icon: 'download',
    labelKey: 'admin.pages.types.cvDownload',
    descriptionKey: 'admin.pages.types.cvDownloadHint',
  },
  prose: {
    icon: 'lightbulb',
    labelKey: 'admin.pages.types.prose',
    descriptionKey: 'admin.pages.types.proseHint',
  },
  'projects-browser': {
    icon: 'search',
    labelKey: 'admin.pages.types.projectsBrowser',
    descriptionKey: 'admin.pages.types.projectsBrowserHint',
  },
  'notes-browser': {
    icon: 'book-open',
    labelKey: 'admin.pages.types.notesBrowser',
    descriptionKey: 'admin.pages.types.notesBrowserHint',
  },
} as const satisfies Record<BlockType, { icon: IconKey; labelKey: string; descriptionKey: string }>;
