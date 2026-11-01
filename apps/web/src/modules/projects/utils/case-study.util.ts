import type { PublicProjectListItem } from '@portfolio/contracts';

import { splitMarkdownSections } from '@/modules/content/utils/split-sections.util';

export function formatPeriod(
  startDate: string,
  endDate: string | null,
  locale: string,
  nowLabel: string,
): string {
  const format = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const start = format.format(new Date(startDate));
  if (!endDate) {
    return `${start} — ${nowLabel}`;
  }
  return `${start} — ${format.format(new Date(endDate))}`;
}

export function splitLimitsAndScope(constraints: string): {
  limits: string;
  scope: { title: string; items: string[] }[];
} {
  const sections = splitMarkdownSections(constraints);
  const titled = sections.filter((section) => section.title);
  const untitled = sections
    .filter((section) => !section.title)
    .map((section) => section.body)
    .join('\n\n');

  return {
    limits: titled.length > 0 ? untitled : constraints.trim(),
    scope: titled.map((section) => ({
      title: section.title,
      items: section.body
        .split('\n')
        .map((line) => line.replace(/^[-*+▹]\s+/, '').trim())
        .filter(Boolean),
    })),
  };
}

export function splitDecisions(decisions: string): { title: string; body: string }[] {
  return splitMarkdownSections(decisions).filter((section) => section.body);
}

export function projectNeighbors<T extends Pick<PublicProjectListItem, 'slug'>>(
  items: T[],
  slug: string,
): { prev: T | null; next: T | null } {
  const index = items.findIndex((item) => item.slug === slug);
  if (index < 0 || items.length < 2) {
    return { prev: null, next: null };
  }
  return {
    prev: items[(index - 1 + items.length) % items.length] ?? null,
    next: items[(index + 1) % items.length] ?? null,
  };
}
