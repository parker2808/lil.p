import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The 11 named type sizes from spec §3.2. tailwind-merge treats unknown
 * `text-*` classes as colors, so `cn('text-title', 'text-primary')` would
 * drop one of them unless these names sit in the font-size group.
 */
const typeSizes = [
  'display',
  'title',
  'heading',
  'subheading',
  'prose',
  'body',
  'meta',
  'eyebrow',
  'ui-title',
  'ui',
  'ui-meta',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...typeSizes] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
