import type { IconKey, Locale, PublicProcessStep } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { ProcessStepRow } from './process-step.entity';

const TRANSLATED = ['title', 'caption'] as const;

export function toPublicProcessStep(row: ProcessStepRow, locale: Locale): PublicProcessStep {
  const { values, lang } = pickGroup(row, TRANSLATED, locale);

  return {
    id: row.id,
    title: values.title ?? '',
    caption: values.caption ?? '',
    iconKey: row.iconKey as IconKey,
    lang,
  };
}
