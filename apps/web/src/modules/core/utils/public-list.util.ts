import { isPlaceholderText } from './placeholder.util';

/** Split a CMS list ("a, b · c") at top-level separators, dropping empty and unfinished items. */
export function splitPublicList(value: string | null | undefined): string[] {
  const items: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value ?? '') {
    if (char === '(') depth += 1;
    if (char === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && /[,·;]/.test(char)) {
      items.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  items.push(current);
  return items.map((item) => item.trim()).filter((item) => !isPlaceholderText(item));
}

/** Join display values, skipping empty and unfinished ones. */
export function joinPublicList(values: (string | null | undefined)[], separator = ' · '): string {
  return values
    .map((value) => value?.trim() ?? '')
    .filter((value) => !isPlaceholderText(value))
    .join(separator);
}
