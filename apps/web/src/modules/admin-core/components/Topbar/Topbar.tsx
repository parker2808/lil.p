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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@portfolio/ui/components/ui/sheet';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ChangePasswordDialog } from '@/modules/admin-auth/components/ChangePasswordDialog/ChangePasswordDialog';

import { logout } from '../../services/auth.service';
import { useMe } from '../../hooks/use-me.hook';
import { useAdminUi } from '../../stores/admin-ui.store';
import { AdminMobileNav } from '../AdminSidebar/AdminSidebar';

export function Topbar({ crumbs, actions }: { crumbs: { label: string }[]; actions?: ReactNode }) {
  const t = useTranslations('admin.shell');
  const me = useMe();
  const { toggleCollapsed } = useAdminUi();
  const router = useRouter();
  const initial = me.name.slice(0, 1);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <header className="admin-topbar border-border flex h-12 shrink-0 items-center gap-3 border-b px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 md:hidden" aria-label={t('menu')}>
            {t('menu')}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar w-60">
          <SheetTitle>{me.name}</SheetTitle>
          <AdminMobileNav />
        </SheetContent>
      </Sheet>
      <Button
        variant="ghost"
        size="sm"
        className="hidden h-8 md:inline-flex"
        onClick={toggleCollapsed}
        aria-label={t('toggleSidebar')}
      >
        {t('toggleSidebar')}
      </Button>
      <Breadcrumb className="hidden sm:block" aria-label={t('breadcrumb')}>
        <BreadcrumbList>
          {crumbs.map((crumb) => (
            <BreadcrumbItem key={crumb.label}>{crumb.label}</BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2">
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
