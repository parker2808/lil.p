'use client';

import { Button } from '@portfolio/ui/components/ui/button';
import { BrandMark } from '@portfolio/ui/components/BrandMark/BrandMark';
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
import { SheetClose } from '@portfolio/ui/components/ui/sheet';
import {
  Activity,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  Globe2,
  GraduationCap,
  Image,
  Inbox,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  ScrollText,
  Settings2,
  Shapes,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navVisibleTo } from '../../constants/admin-nav.constant';
import { useMe } from '../../hooks/use-me.hook';
import { useAdminUi } from '../../stores/admin-ui.store';
import { RoleGate } from '../RoleGate/RoleGate';

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  posts: NotebookPen,
  pages: FileText,
  media: Image,
  tags: Tags,
  home: LayoutDashboard,
  about: UserRound,
  contact: Inbox,
  experience: BriefcaseBusiness,
  education: GraduationCap,
  skills: Shapes,
  principles: BookOpen,
  process: ListChecks,
  stats: Activity,
  inbox: Inbox,
  site: Settings2,
  profile: UserRound,
  domains: Globe2,
  users: Users,
  audit: ScrollText,
  analytics: BarChart3,
};

export function AdminSidebar() {
  const t = useTranslations('admin.nav');
  const { role, name } = useMe();
  const { collapsed } = useAdminUi();
  const pathname = usePathname();
  const groups = navVisibleTo(role);

  return (
    <Sidebar collapsed={collapsed} className="hidden lg:flex">
      <SidebarHeader className="gap-2">
        <Link href="/admin" aria-label="lil.parker" className="admin-brand-link">
          <BrandMark compact={collapsed} />
        </Link>
        {collapsed ? null : (
          <span className="text-ui-meta text-muted-foreground truncate font-mono">{name}</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group, index) => (
          <SidebarGroup key={group.key}>
            {collapsed ? null : (
              <SidebarGroupLabel>
                <span className="mr-2 font-mono" aria-hidden>
                  {['I', 'II', 'III', 'IV', 'V'][index] ?? index + 1}
                </span>
                {t(`groups.${group.key}`)}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = NAV_ICONS[item.key];
                const active =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
                const itemNode = (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild active={active}>
                      <Link
                        href={item.href}
                        title={t(item.key)}
                        aria-current={active ? 'page' : undefined}
                      >
                        {Icon ? <Icon className="size-4.5 shrink-0" aria-hidden /> : null}
                        {collapsed ? <span className="sr-only">{t(item.key)}</span> : t(item.key)}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
                return item.key === 'users' || item.key === 'inbox' ? (
                  <RoleGate key={item.href} allow={['admin']}>
                    {itemNode}
                  </RoleGate>
                ) : (
                  itemNode
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminMobileNav({ omit = [] }: { omit?: string[] }) {
  const t = useTranslations('admin.nav');
  const { role } = useMe();
  const pathname = usePathname();
  const groups = navVisibleTo(role).filter((group) => !omit.includes(group.key));

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pb-2">
      {groups.map((group, index) => (
        <div key={group.key} className="flex flex-col gap-1">
          <p className="text-ui-meta text-muted-foreground">
            <span className="mr-2 font-mono" aria-hidden>
              {['I', 'II', 'III', 'IV', 'V'][index] ?? index + 1}
            </span>
            {t(`groups.${group.key}`)}
          </p>
          {group.items.map((item) => (
            <SheetClose asChild key={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="min-h-11 justify-start"
                asChild
              >
                <Link href={item.href}>{t(item.key)}</Link>
              </Button>
            </SheetClose>
          ))}
        </div>
      ))}
    </nav>
  );
}
