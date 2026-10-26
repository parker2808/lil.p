import { publishLint } from '@portfolio/contracts';

export function splitFactLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function missingViFieldNames(
  pairs: Array<{ name: string; en: string | null | undefined; vi: string | null | undefined }>,
): string[] {
  return pairs
    .filter((pair) => Boolean(pair.en?.trim()) && !pair.vi?.trim())
    .map((pair) => pair.name);
}

export function lintFieldNames(fields: Record<string, string | null | undefined>): string[] {
  return Object.keys(publishLint(fields).fieldErrors);
}

export const PROJECT_LOCALE_FIELDS = [
  'title',
  'tagline',
  'role',
  'problem',
  'constraints',
  'approach',
  'decisions',
  'outcome',
  'lessons',
  'keyFacts',
  'factChips',
] as const;

export const POST_LOCALE_FIELDS = ['title', 'excerpt', 'body', 'takeaways'] as const;
