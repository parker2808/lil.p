import type { PageHeaderBack } from '@portfolio/ui/components/PageHeader/PageHeader';
import { useTranslations } from 'next-intl';

import { ADMIN_NAV } from '../constants/admin-nav.constant';

export function useAdminBack(navKey: string): PageHeaderBack {
  const navT = useTranslations('admin.nav');
  const shellT = useTranslations('admin.shell');
  const item = ADMIN_NAV.flatMap((group) => group.items).find((entry) => entry.key === navKey);
  if (!item && navKey === 'pages') {
    const section = navT('pages');
    return { href: '/admin/pages/home', label: section, ariaLabel: shellT('back', { section }) };
  }
  if (!item && navKey === 'experience') {
    const section = navT('experience');
    return {
      href: '/admin/pages/about?tab=experience',
      label: section,
      ariaLabel: shellT('back', { section }),
    };
  }
  if (!item) {
    throw new Error(`Unknown admin nav key: ${navKey}`);
  }
  const section = navT(navKey);
  return { href: item.href, label: section, ariaLabel: shellT('back', { section }) };
}
