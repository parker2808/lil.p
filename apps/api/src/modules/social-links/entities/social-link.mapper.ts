import type { AdminSocialLink, Locale, PublicSocialLink } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { SocialLinkRow } from './social-link.entity';

export function toPublicSocialLink(row: SocialLinkRow, locale: Locale): PublicSocialLink {
  const { values, lang } = pickGroup(row, ['label'] as const, locale);
  return {
    id: row.id,
    kind: row.kind,
    label: values.label ?? '',
    url: row.url,
    showInHeader: row.showInHeader,
    showInCta: row.showInCta,
    lang,
  };
}

export function toAdminDto(row: SocialLinkRow): AdminSocialLink {
  return {
    id: row.id,
    kind: row.kind,
    labelEn: row.labelEn,
    labelVi: row.labelVi,
    url: row.url,
    showInHeader: row.showInHeader,
    showInCta: row.showInCta,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}
