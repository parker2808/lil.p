'use client';

import { qk } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@portfolio/ui/components/ui/sheet';
import { useCloseOnNavigate } from '@portfolio/ui/hooks/use-close-on-navigate.hook';
import { useQuery } from '@tanstack/react-query';
import { Ellipsis, Files, Inbox, LayoutDashboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

import { fetchUnreadCount } from '@/modules/admin-inbox/services/admin-inbox.service';

import { ADMIN_NAV } from '../../constants/admin-nav.constant';
import { useIsAdmin } from '../../hooks/use-me.hook';
import { AdminMobileNav } from '../AdminSidebar/AdminSidebar';

const KEYBOARD_MIN_HEIGHT = 120;
const CONTENT_HREFS = ADMIN_NAV.find((group) => group.key === 'content')!.items.map(
  (item) => item.href,
);

function subscribeViewport(callback: () => void) {
  const viewport = window.visualViewport;
  viewport?.addEventListener('resize', callback);
  viewport?.addEventListener('scroll', callback);
  return () => {
    viewport?.removeEventListener('resize', callback);
    viewport?.removeEventListener('scroll', callback);
  };
}

function keyboardOpen() {
  const viewport = window.visualViewport;
  if (!viewport) return false;
  return window.innerHeight - viewport.height - viewport.offsetTop > KEYBOARD_MIN_HEIGHT;
}

function within(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminBottomBar() {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();
  const more = useCloseOnNavigate(pathname);
  const isAdmin = useIsAdmin();
  const keyboard = useSyncExternalStore(subscribeViewport, keyboardOpen, () => false);
  const unread = useQuery({
    queryKey: qk.admin.inbox.unread,
    queryFn: fetchUnreadCount,
    enabled: isAdmin,
  });
  const count = unread.data?.unread ?? 0;

  const items = [
    {
      href: '/admin',
      label: t('groups.overview'),
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      href: CONTENT_HREFS[0]!,
      label: t('groups.content'),
      icon: Files,
      active: CONTENT_HREFS.some((href) => within(pathname, href)),
    },
    ...(isAdmin
      ? [
          {
            href: '/admin/inbox',
            label: t('inbox'),
            icon: Inbox,
            active: within(pathname, '/admin/inbox'),
          },
        ]
      : []),
  ];

  return (
    <nav aria-label={t('sections')} className="admin-bottom-bar" data-keyboard-open={keyboard}>
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          className="admin-bottom-bar-item"
          aria-current={active ? 'page' : undefined}
        >
          <span className="relative">
            <Icon className="size-5" aria-hidden />
            {href === '/admin/inbox' && count > 0 ? (
              <Badge variant="primary" className="admin-bottom-bar-badge">
                {count > 9 ? '9+' : count}
              </Badge>
            ) : null}
          </span>
          {label}
        </Link>
      ))}
      <Sheet open={more.open} onOpenChange={more.onOpenChange}>
        <SheetTrigger className="admin-bottom-bar-item">
          <Ellipsis className="size-5" aria-hidden />
          {t('more')}
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar w-60">
          <SheetTitle>{t('more')}</SheetTitle>
          <AdminMobileNav omit={['overview', 'inbox']} />
        </SheetContent>
      </Sheet>
    </nav>
  );
}
