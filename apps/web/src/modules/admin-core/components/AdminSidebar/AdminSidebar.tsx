'use client';

import { Button } from '@portfolio/ui/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@portfolio/ui/components/ui/sidebar';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navVisibleTo } from '../../constants/admin-nav.constant';
import { useMe } from '../../hooks/use-me.hook';
import { useAdminUi } from '../../stores/admin-ui.store';

export function AdminSidebar() {
  const t = useTranslations('admin.nav');
  const { role, name } = useMe();
  const { collapsed } = useAdminUi();
  const pathname = usePathname();
  const groups = navVisibleTo(role);

  return (
    <Sidebar collapsed={collapsed} className="hidden md:flex">
      <SidebarHeader>
        <p className="text-ui-title truncate font-medium">{collapsed ? name.slice(0, 1) : name}</p>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.key}>
            {collapsed ? null : <SidebarGroupLabel>{t(`groups.${group.key}`)}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild active={active}>
                      <Link href={item.href} title={t(item.key)}>
                        {collapsed ? t(item.key).slice(0, 1) : t(item.key)}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminMobileNav() {
  const t = useTranslations('admin.nav');
  const { role } = useMe();
  const pathname = usePathname();
  const groups = navVisibleTo(role);

  return (
    <nav className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-1">
          <p className="text-ui-meta text-muted-foreground">{t(`groups.${group.key}`)}</p>
          {group.items.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className="h-8 justify-start"
              asChild
            >
              <Link href={item.href}>{t(item.key)}</Link>
            </Button>
          ))}
        </div>
      ))}
    </nav>
  );
}
