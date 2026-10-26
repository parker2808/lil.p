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
    key: 'main',
    items: [
      { href: '/admin', key: 'dashboard', roles: ['admin', 'user'] },
      { href: '/admin/inbox', key: 'inbox', roles: ['admin'] },
    ],
  },
  {
    key: 'content',
    items: [
      { href: '/admin/projects', key: 'projects', roles: ['admin', 'user'] },
      { href: '/admin/posts', key: 'posts', roles: ['admin', 'user'] },
      { href: '/admin/experience', key: 'experience', roles: ['admin', 'user'] },
      { href: '/admin/education', key: 'education', roles: ['admin', 'user'] },
      { href: '/admin/principles', key: 'principles', roles: ['admin', 'user'] },
      { href: '/admin/skills', key: 'skills', roles: ['admin', 'user'] },
      { href: '/admin/tags', key: 'tags', roles: ['admin', 'user'] },
      { href: '/admin/domains', key: 'domains', roles: ['admin', 'user'] },
      { href: '/admin/process', key: 'process', roles: ['admin', 'user'] },
      { href: '/admin/stats', key: 'stats', roles: ['admin', 'user'] },
    ],
  },
  {
    key: 'site',
    items: [
      { href: '/admin/site', key: 'site', roles: ['admin', 'user'] },
      { href: '/admin/profile', key: 'profile', roles: ['admin', 'user'] },
      { href: '/admin/media', key: 'media', roles: ['admin', 'user'] },
    ],
  },
  {
    key: 'insights',
    items: [
      { href: '/admin/analytics', key: 'analytics', roles: ['admin', 'user'] },
      { href: '/admin/audit', key: 'audit', roles: ['admin'] },
    ],
  },
  {
    key: 'access',
    items: [{ href: '/admin/users', key: 'users', roles: ['admin'] }],
  },
];

export function navVisibleTo(role: Role): AdminNavGroup[] {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
