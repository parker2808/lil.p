'use client';

import { normalizeSearch } from '../../utils/search.util';

import { Button } from '@portfolio/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@portfolio/ui/components/ui/dialog';
import { Input } from '@portfolio/ui/components/ui/input';
import { Kbd } from '@portfolio/ui/components/ui/kbd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { navVisibleTo } from '../../constants/admin-nav.constant';
import { useIsAdmin, useMe } from '../../hooks/use-me.hook';
import { useAdminUi } from '../../stores/admin-ui.store';

const META = '⌘';
const KEY = 'K';

export function AdminCommandPalette() {
  const t = useTranslations('admin');
  const { role } = useMe();
  const isAdmin = useIsAdmin();
  const { paletteOpen, setPaletteOpen, toggleCollapsed } = useAdminUi();
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
      if (event.key === '[' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          return;
        }
        event.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, setPaletteOpen, toggleCollapsed]);

  const items = useMemo(() => {
    const routes = navVisibleTo(role).flatMap((group) =>
      group.items.map((item) => ({
        href: item.href,
        label: t(`nav.${item.key}`),
      })),
    );
    if (isAdmin) {
      routes.push(
        { href: '/admin/projects/new', label: t('palette.newProject') },
        { href: '/admin/posts/new', label: t('palette.newPost') },
      );
    }
    const needle = normalizeSearch(query);
    return needle ? routes.filter((item) => normalizeSearch(item.label).includes(needle)) : routes;
  }, [isAdmin, query, role, t]);

  return (
    <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          aria-label={`${t('palette.open')} ${META}${KEY}`}
        >
          <span className="hidden lg:inline">{t('palette.open')}</span>
          <Kbd>{META}</Kbd>
          <Kbd>{KEY}</Kbd>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('palette.open')}</DialogTitle>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={t('palette.open')}
        />
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Button
                variant="ghost"
                className="h-8 w-full justify-start"
                onClick={() => {
                  setPaletteOpen(false);
                  router.push(item.href);
                }}
              >
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
