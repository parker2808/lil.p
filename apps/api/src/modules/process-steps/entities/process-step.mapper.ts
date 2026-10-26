import type { AdminProcessStep, IconKey, Locale, PublicProcessStep } from '@portfolio/contracts';

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

export function toAdminDto(row: ProcessStepRow): AdminProcessStep {
  return {
    id: row.id,
    titleEn: row.titleEn,
    titleVi: row.titleVi,
    captionEn: row.captionEn,
    captionVi: row.captionVi,
    iconKey: row.iconKey as IconKey,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}
