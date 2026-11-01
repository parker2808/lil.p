'use client';

import { type ReactNode, useState } from 'react';
import { Avatar, AvatarFallback } from '@portfolio/ui/components/ui/avatar';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from '@portfolio/ui/components/ui/breadcrumb';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@portfolio/ui/components/ui/dropdown-menu';
import { IconButton } from '@portfolio/ui/components/ui/icon-button';
import { inputClassName } from '@portfolio/ui/components/ui/input';
import { TooltipProvider } from '@portfolio/ui/components/ui/tooltip';
import { cn } from '@portfolio/ui/lib/utils';
import { ArrowLeft, Ellipsis, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { ChangePasswordDialog } from '@/modules/admin-auth/components/ChangePasswordDialog/ChangePasswordDialog';

import { navItemFor } from '../../constants/admin-nav.constant';
import { logout } from '../../services/auth.service';
import { useMe } from '../../hooks/use-me.hook';
import { TOPBAR_STATUS_ID } from '../../hooks/use-topbar-status-slot.hook';
import { useAdminUi } from '../../stores/admin-ui.store';
import { switchAdminLocale as switchLocale } from '../../utils/admin-locale.util';

export function Topbar({ crumbs, actions }: { crumbs: { label: string }[]; actions?: ReactNode }) {
  const t = useTranslations('admin.shell');
  const tNav = useTranslations('admin.nav');
  const locale = useLocale();
  const me = useMe();
  const { collapsed, toggleCollapsed } = useAdminUi();
  const router = useRouter();
  const pathname = usePathname();
  const section = navItemFor(pathname);
  const initial = me.name.slice(0, 1);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <header className="admin-topbar border-border flex h-12 shrink-0 items-center gap-3 border-b px-4">
      {section ? (
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          {section.href !== pathname ? (
            <Link
              href={section.href}
              className="tap justify-center"
              aria-label={t('back', { section: tNav(section.key) })}
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
          ) : null}
          <span className="text-ui-title truncate font-medium">{tNav(section.key)}</span>
        </div>
      ) : null}
      <div id={TOPBAR_STATUS_ID} className="ml-auto flex items-center lg:hidden" />
      <TooltipProvider>
        <IconButton
          variant="ghost"
          className="hidden lg:inline-flex"
          label={collapsed ? t('expandSidebar') : t('toggleSidebar')}
          aria-expanded={!collapsed}
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden className="size-4" />
          ) : (
            <PanelLeftClose aria-hidden className="size-4" />
          )}
        </IconButton>
      </TooltipProvider>
      <Breadcrumb className="hidden lg:block" aria-label={t('breadcrumb')}>
        <BreadcrumbList>
          {crumbs.map((crumb) => (
            <BreadcrumbItem key={crumb.label}>{crumb.label}</BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-2 lg:ml-auto">
        <div className="hidden items-center gap-2 lg:flex">{actions}</div>
        <label className="text-ui-meta text-muted-foreground hidden items-center gap-1 lg:flex">
          {t('language')}
          <select
            aria-label={t('language')}
            className={cn(inputClassName, 'text-foreground w-auto px-2')}
            value={locale}
            onChange={(event) => switchLocale(event.target.value)}
          >
            <option value="en">{t('localeEn')}</option>
            <option value="vi">{t('localeVi')}</option>
          </select>
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Ellipsis className="size-5 lg:hidden" aria-hidden />
              <span className="sr-only lg:hidden">{t('account')}</span>
              <Avatar className="hidden size-6 lg:flex">
                <AvatarFallback className="text-ui">{initial}</AvatarFallback>
              </Avatar>
              <span className="text-ui hidden lg:inline">{me.name}</span>
              <Badge variant="outline" className="hidden lg:inline-flex">
                {me.role}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(['en', 'vi'] as const).map((value) => (
              <DropdownMenuItem
                key={value}
                className="lg:hidden"
                disabled={value === locale}
                onSelect={() => switchLocale(value)}
              >
                {t('switchLanguage', { locale: t(value === 'en' ? 'localeEn' : 'localeVi') })}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
              {t('changePassword')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={async () => {
                await logout();
                router.replace('/admin/login');
              }}
            >
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </header>
  );
}
