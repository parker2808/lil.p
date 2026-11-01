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
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { navVisibleTo } from '../../constants/admin-nav.constant';
import { useIsAdmin, useMe } from '../../hooks/use-me.hook';
import { useAdminUi } from '../../stores/admin-ui.store';
import { switchAdminLocale } from '../../utils/admin-locale.util';
import { createSequenceListener, type KeySequence } from '../../utils/shortcut.util';

const META = '⌘';
const KEY = 'K';

const SEQUENCES: Record<string, KeySequence> = {
  createProject: ['c', 'p'],
  writePost: ['w', 'p'],
  inbox: ['g', 'i'],
};

type PaletteItem = { id: string; label: string; run: () => void; keys?: KeySequence };

export function AdminCommandPalette() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { role } = useMe();
  const isAdmin = useIsAdmin();
  const { paletteOpen, setPaletteOpen, toggleCollapsed, publishAction } = useAdminUi();
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

  const groups = useMemo(() => {
    const go = (href: string) => () => router.push(href);
    const otherLocale = locale === 'en' ? 'vi' : 'en';
    const actions: PaletteItem[] = [];
    if (isAdmin) {
      actions.push(
        {
          id: 'createProject',
          label: t('palette.createProject'),
          run: go('/admin/projects/new'),
        },
        { id: 'writePost', label: t('palette.writePost'), run: go('/admin/posts/new') },
      );
    }
    if (publishAction) {
      actions.push({ id: 'publish', label: t('palette.publish'), run: publishAction });
    }
    actions.push(
      {
        id: 'openSite',
        label: t('palette.openSite'),
        run: () => window.open(`/${locale}`, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'switchLanguage',
        label: t('palette.switchLanguage', {
          locale: t(otherLocale === 'en' ? 'shell.localeEn' : 'shell.localeVi'),
        }),
        run: () => switchAdminLocale(otherLocale),
      },
    );
    const routes: PaletteItem[] = navVisibleTo(role).flatMap((group) =>
      group.items.map((item) => ({
        id: item.key,
        label: t(`nav.${item.key}`),
        run: go(item.href),
      })),
    );
    const withKeys = (item: PaletteItem): PaletteItem => ({ ...item, keys: SEQUENCES[item.id] });
    return [
      { key: 'actions', items: actions.map(withKeys) },
      { key: 'navigate', items: routes.map(withKeys) },
    ];
  }, [isAdmin, locale, publishAction, role, router, t]);

  const latestGroups = useRef(groups);
  useEffect(() => {
    latestGroups.current = groups;
  }, [groups]);

  useEffect(() => {
    const items = () => latestGroups.current.flatMap((group) => group.items);
    const onKey = createSequenceListener(
      () => items().flatMap((item) => (item.keys ? [{ id: item.id, keys: item.keys }] : [])),
      (id) =>
        items()
          .find((item) => item.id === id)
          ?.run(),
    );
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const needle = normalizeSearch(query);
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: needle
        ? group.items.filter((item) => normalizeSearch(item.label).includes(needle))
        : group.items,
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="pointer-coarse:hidden"
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
        {visibleGroups.map((group) => (
          <section
            key={group.key}
            aria-labelledby={`palette-${group.key}`}
            className="flex flex-col gap-1"
          >
            <h2 id={`palette-${group.key}`} className="text-ui-meta text-muted-foreground px-2">
              {t(`palette.${group.key}`)}
            </h2>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setPaletteOpen(false);
                      item.run();
                    }}
                  >
                    {item.label}
                    {item.keys ? (
                      <span className="ml-auto flex gap-1">
                        {item.keys.map((key) => (
                          <Kbd key={key}>{key.toUpperCase()}</Kbd>
                        ))}
                      </span>
                    ) : null}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </DialogContent>
    </Dialog>
  );
}
