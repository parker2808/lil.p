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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@portfolio/ui/components/ui/sheet';
import { TooltipProvider } from '@portfolio/ui/components/ui/tooltip';
import { useCloseOnNavigate } from '@portfolio/ui/hooks/use-close-on-navigate.hook';
import { cn } from '@portfolio/ui/lib/utils';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

import { ChangePasswordDialog } from '@/modules/admin-auth/components/ChangePasswordDialog/ChangePasswordDialog';

import { logout } from '../../services/auth.service';
import { useMe } from '../../hooks/use-me.hook';
import { useAdminUi } from '../../stores/admin-ui.store';
import { AdminMobileNav } from '../AdminSidebar/AdminSidebar';

export function Topbar({ crumbs, actions }: { crumbs: { label: string }[]; actions?: ReactNode }) {
  const t = useTranslations('admin.shell');
  const locale = useLocale();
  const me = useMe();
  const { collapsed, toggleCollapsed } = useAdminUi();
  const router = useRouter();
  const pathname = usePathname();
  const menu = useCloseOnNavigate(pathname);
  const initial = me.name.slice(0, 1);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <header className="admin-topbar border-border flex h-12 shrink-0 items-center gap-3 border-b px-4">
      <Sheet open={menu.open} onOpenChange={menu.onOpenChange}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden" aria-label={t('menu')}>
            {t('menu')}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar w-60">
          <SheetTitle>{me.name}</SheetTitle>
          <AdminMobileNav />
        </SheetContent>
      </Sheet>
      <TooltipProvider>
        <IconButton
          variant="ghost"
          className="hidden md:inline-flex"
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
      <Breadcrumb className="hidden sm:block" aria-label={t('breadcrumb')}>
        <BreadcrumbList>
          {crumbs.map((crumb) => (
            <BreadcrumbItem key={crumb.label}>{crumb.label}</BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <label className="text-ui-meta text-muted-foreground flex items-center gap-1">
          {t('language')}
          <select
            aria-label={t('language')}
            className={cn(inputClassName, 'text-foreground w-auto px-2')}
            value={locale}
            onChange={(event) => {
              document.cookie = `NEXT_LOCALE=${event.target.value}; path=/; max-age=31536000; samesite=lax`;
              window.location.reload();
            }}
          >
            <option value="en">{t('localeEn')}</option>
            <option value="vi">{t('localeVi')}</option>
          </select>
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Avatar className="size-6">
                <AvatarFallback className="text-ui">{initial}</AvatarFallback>
              </Avatar>
              <span className="text-ui hidden sm:inline">{me.name}</span>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {me.role}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
