import type { Locale } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { absoluteUrl } from './site-url.util';

export function buildAlternates(locale: Locale, path: string): Metadata['alternates'] {
  return {
    canonical: absoluteUrl(locale, path),
    languages: {
      en: absoluteUrl('en', path),
      vi: absoluteUrl('vi', path),
      'x-default': absoluteUrl('en', path),
    },
  };
}
