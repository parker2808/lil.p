import type { Role } from '@portfolio/contracts';

export type AdminNavItem = {
  href: string;
  key: string;
  roles: Role[];
};

export type AdminNavGroup = {
  key: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    key: 'overview',
    items: [{ href: '/admin', key: 'dashboard', roles: ['admin', 'user'] }],
  },
  {
    key: 'content',
    items: [
      { href: '/admin/projects', key: 'projects', roles: ['admin', 'user'] },
      { href: '/admin/posts', key: 'posts', roles: ['admin', 'user'] },
      { href: '/admin/media', key: 'media', roles: ['admin', 'user'] },
    ],
  },
  {
    key: 'pages',
    items: [
      { href: '/admin/pages/home', key: 'home', roles: ['admin', 'user'] },
      { href: '/admin/pages/about', key: 'about', roles: ['admin', 'user'] },
      { href: '/admin/pages/contact', key: 'contact', roles: ['admin', 'user'] },
    ],
  },
  {
    key: 'inbox',
    items: [{ href: '/admin/inbox', key: 'inbox', roles: ['admin'] }],
  },
  {
    key: 'settings',
    items: [
      { href: '/admin/site', key: 'site', roles: ['admin', 'user'] },
      { href: '/admin/profile', key: 'profile', roles: ['admin', 'user'] },
      { href: '/admin/users', key: 'users', roles: ['admin'] },
      { href: '/admin/audit', key: 'audit', roles: ['admin'] },
      { href: '/admin/analytics', key: 'analytics', roles: ['admin', 'user'] },
    ],
  },
];

export function navItemFor(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV.flatMap((group) => group.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

export function navVisibleTo(role: Role): AdminNavGroup[] {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
