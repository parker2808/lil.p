import { MARKDOWN_IMAGE_PREFIX, MARKDOWN_LINK_PROTOCOLS } from '../constants/markdown.constant';

export function isAllowedMarkdownUrl(href: string): boolean {
  if (href.startsWith('#') || href.startsWith('/')) {
    return !href.startsWith('//');
  }
  const protocol = href.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  return protocol != null && (MARKDOWN_LINK_PROTOCOLS as readonly string[]).includes(protocol);
}

export function isAllowedImageSrc(src: string): boolean {
  return src.startsWith(MARKDOWN_IMAGE_PREFIX);
}
