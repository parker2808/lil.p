import type { Locale } from '@portfolio/contracts';

export type BlockContext = {
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
  draft?: boolean;
};
