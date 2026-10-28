/** Hide editorial placeholders without changing stored CMS data. */
export function isPlaceholderText(value: string | null | undefined): boolean {
  return !value?.trim() || /\b(?:TODO|TBD|lorem ipsum)\b/i.test(value);
}
