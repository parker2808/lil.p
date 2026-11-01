/** Hide editorial placeholders without changing stored CMS data. */
export function isPlaceholderText(value: string | null | undefined): boolean {
  return !value?.trim() || /\b(?:TODO|TBD|lorem ipsum)\b/i.test(value);
}

/** Replace unfinished text at every depth without changing the public data shape. */
export function guardPublicText<T>(value: T): T {
  if (typeof value === 'string') return (isPlaceholderText(value) ? '' : value) as T;
  if (Array.isArray(value)) return value.map(guardPublicText) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, field]) => [key, guardPublicText(field)]),
    ) as T;
  }
  return value;
}
