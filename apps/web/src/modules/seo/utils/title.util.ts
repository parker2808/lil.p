export function firstText(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return undefined;
}

export function formatTitle(seoTitle: string, siteName: string): string {
  const title = seoTitle.trim();
  const name = siteName.trim();
  if (!title) return name;
  if (!name || title === name) return title;
  return `${title} · ${name}`;
}
