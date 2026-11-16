export function previewVersion(
  searchParams?: Record<string, string | string[] | undefined>,
): number | undefined {
  const value = searchParams?.v;
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const version = Number(raw);
  return Number.isSafeInteger(version) && version > 0 ? version : undefined;
}
