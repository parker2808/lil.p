'use client';

import type { Locale } from '@portfolio/contracts';
import { DemoError } from './DemoMore';

export function DemoStatePreview({ locale }: { locale: Locale }) {
  return <DemoError locale={locale} reset={() => window.location.reload()} />;
}
