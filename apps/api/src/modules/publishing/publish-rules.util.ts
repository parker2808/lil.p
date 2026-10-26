import { publishLint } from '@portfolio/contracts';

const IMAGE_MARKDOWN = /!\[([^\]]*)\]\(([^)]+)\)/g;

export function requiredFieldErrors(
  fields: Record<string, string | null | undefined>,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const [path, raw] of Object.entries(fields)) {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      fieldErrors[path] = ['Required'];
    }
  }
  return fieldErrors;
}

export function mergeFieldErrors(
  ...groups: Array<Record<string, string[]>>
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const group of groups) {
    for (const [path, messages] of Object.entries(group)) {
      fieldErrors[path] = [...(fieldErrors[path] ?? []), ...messages];
    }
  }
  return fieldErrors;
}

export function mediaAltErrors(
  media: { altEn: string; mimeType: string } | null | undefined,
  path: string,
): Record<string, string[]> {
  if (media && media.mimeType.startsWith('image/') && !media.altEn.trim()) {
    return { [path]: ['Image is missing alt text'] };
  }
  return {};
}

export function markdownAltErrors(
  markdown: string | null | undefined,
  path: string,
): Record<string, string[]> {
  if (!markdown) {
    return {};
  }
  const messages: string[] = [];
  for (const match of markdown.matchAll(IMAGE_MARKDOWN)) {
    if (!match[1]?.trim()) {
      messages.push('Image is missing alt text');
    }
  }
  return messages.length > 0 ? { [path]: messages } : {};
}

export function lintErrors(
  fields: Record<string, string | null | undefined>,
): Record<string, string[]> {
  return publishLint(fields).fieldErrors;
}
