export const MARKDOWN_HEADING_LEVELS = [2, 3] as const;

export const MARKDOWN_CALLOUT_KINDS = ['NOTE', 'WARNING'] as const;

export const MARKDOWN_CODE_LANGUAGES = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'bash',
  'css',
  'html',
  'sql',
  'prisma',
  'yaml',
  'md',
  'diff',
  'vue',
] as const;

export const MARKDOWN_LINK_PROTOCOLS = ['http', 'https', 'mailto'] as const;

export const MARKDOWN_IMAGE_PREFIX = '/api/public/media/';

export type MarkdownCalloutKind = (typeof MARKDOWN_CALLOUT_KINDS)[number];
export type MarkdownCodeLanguage = (typeof MARKDOWN_CODE_LANGUAGES)[number];
