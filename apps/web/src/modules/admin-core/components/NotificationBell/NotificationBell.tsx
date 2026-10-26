'use client';

import { qk } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { fetchUnreadCount } from '@/modules/admin-inbox/services/admin-inbox.service';

import { useIsAdmin } from '../../hooks/use-me.hook';

export function NotificationBell() {
  const isAdmin = useIsAdmin();
  const t = useTranslations('admin.inbox');
  const unread = useQuery({
    queryKey: qk.admin.inbox.unread,
    queryFn: fetchUnreadCount,
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return null;
  }

  const count = unread.data?.unread ?? 0;

  return (
    <Link
      href="/admin/inbox"
      aria-label={t('bell', { count })}
      className="hover:bg-accent relative inline-flex h-8 items-center gap-2 rounded-md px-2"
    >
      <span className="text-ui">{t('bellShort')}</span>
      {count > 0 ? <Badge variant="primary">{count > 9 ? t('bellOverflow') : count}</Badge> : null}
      <span className="sr-only" aria-live="polite">
        {t('bell', { count })}
      </span>
    </Link>
  );
}
