'use client';

import type { PublicNavItem } from '@portfolio/contracts';
import { Input } from '@portfolio/ui/components/ui/input';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useState } from 'react';

import { Link, usePathname } from '@i18n/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@portfolio/ui/components/ui/dialog';
import { useTheme } from 'next-themes';

import { useNotesSearch } from '@/modules/notes/hooks/use-notes-search.hook';
import { QueryProvider } from '../Providers/QueryProvider';

const EN = 'EN';
const VI = 'VI';

type CommandPaletteDialogProps = {
  nav: PublicNavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
};

export function CommandPaletteDialog(props: CommandPaletteDialogProps) {
  return (
    <QueryProvider>
      <CommandPaletteDialogContent {...props} />
    </QueryProvider>
  );
}

function CommandPaletteDialogContent({
  nav,
  open,
  onOpenChange,
  trigger,
}: CommandPaletteDialogProps) {
  const t = useTranslations('core');
  const notes = useTranslations('notes');
  const locale = useLocale();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query.trim()), 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  const posts = useNotesSearch({
    locale: locale === 'vi' ? 'vi' : 'en',
    params: { q: debounced || undefined, pageSize: 5, sort: '-publishedAt' },
    enabled: open && Boolean(debounced),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('command')}</DialogTitle>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={notes('search')}
          aria-label={notes('search')}
        />
        {debounced && posts.data?.items.length ? (
          <ul className="flex flex-col gap-1">
            {posts.data.items.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/notes/${post.slug}`}
                  className="text-ui hover:bg-accent block rounded-md px-2 py-2"
                  onClick={() => onOpenChange(false)}
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="text-ui hover:bg-accent rounded-md px-2 py-2"
              onClick={() => onOpenChange(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="text-ui hover:bg-accent rounded-md px-2 py-2 text-left"
            onClick={() => setTheme('light')}
          >
            {t('themeLight')}
          </button>
          <button
            type="button"
            className="text-ui hover:bg-accent rounded-md px-2 py-2 text-left"
            onClick={() => setTheme('dark')}
          >
            {t('themeDark')}
          </button>
          <Link
            href={pathname}
            locale="en"
            className="text-ui hover:bg-accent rounded-md px-2 py-2"
            onClick={() => onOpenChange(false)}
          >
            {EN}
          </Link>
          <Link
            href={pathname}
            locale="vi"
            className="text-ui hover:bg-accent rounded-md px-2 py-2"
            onClick={() => onOpenChange(false)}
          >
            {VI}
          </Link>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
