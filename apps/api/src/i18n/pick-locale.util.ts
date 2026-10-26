import type { Locale } from '@portfolio/contracts';

type EnViKey = string;

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * D19: a group uses Vietnamese only when every translatable field that
 * has an English value also has a Vietnamese value. Otherwise the whole
 * group is English with `lang: "en"`.
 */
export function pickGroup<K extends EnViKey>(
  row: Record<string, unknown>,
  keys: readonly K[],
  locale: Locale,
): { values: Record<K, string | null>; lang: Locale } {
  const englishReady = keys.filter((key) => hasText(row[`${key}En`]));
  const useVi =
    locale === 'vi' &&
    englishReady.every((key) => hasText(row[`${key}Vi`])) &&
    englishReady.length > 0;

  const lang: Locale = useVi ? 'vi' : 'en';
  const suffix = lang === 'vi' ? 'Vi' : 'En';

  const values = {} as Record<K, string | null>;
  for (const key of keys) {
    const raw = row[`${key}${suffix}`];
    values[key] = hasText(raw) ? raw : null;
  }

  return { values, lang };
}
