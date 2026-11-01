'use client';

import { qk } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
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
    <Button variant="ghost" size="sm" asChild>
      <Link href="/admin/inbox">
        {t('bellShort')}
        {count > 0 ? (
          <Badge variant="primary">{count > 9 ? t('bellOverflow') : count}</Badge>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {t('bell', { count })}
        </span>
      </Link>
    </Button>
  );
}
