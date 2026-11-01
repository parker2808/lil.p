'use client';

import type { PublicNavItem } from '@portfolio/contracts';
import { Input } from '@portfolio/ui/components/ui/input';
import { useLocale, useTranslations } from 'next-intl';
import { type ComponentProps, type ReactNode, useEffect, useId, useState } from 'react';

import { Link, usePathname } from '@i18n/navigation';
import { Dialog, DialogContent, DialogTitle } from '@portfolio/ui/components/ui/dialog';
import { cn } from '@portfolio/ui/lib/utils';
import { useTheme } from 'next-themes';

import { useNotesSearch } from '@/modules/notes/hooks/use-notes-search.hook';
import { QueryProvider } from '../Providers/QueryProvider';
import type { PaletteCaseStudy } from './CommandPalette';

const ITEM =
  'text-ui hover:bg-accent focus-visible:bg-accent block w-full rounded-md px-2 py-2 text-left';

type CommandPaletteDialogProps = {
  nav: PublicNavItem[];
  caseStudies: PaletteCaseStudy[];
  email?: string;
  resumeUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: ComponentProps<typeof DialogContent>['onCloseAutoFocus'];
};

export function CommandPaletteDialog(props: CommandPaletteDialogProps) {
  return (
    <QueryProvider>
      <CommandPaletteDialogContent {...props} />
    </QueryProvider>
  );
}

function PaletteGroup({ label, children }: { label: string; children: ReactNode[] }) {
  const id = useId();
  if (children.length === 0) return null;
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-1">
      <p id={id} className="text-meta text-muted-foreground px-2 pt-2">
        {label}
      </p>
      <ul className="flex flex-col">
        {children.map((child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </div>
  );
}

function CommandPaletteDialogContent({
  nav,
  caseStudies,
  email,
  resumeUrl,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: CommandPaletteDialogProps) {
  const t = useTranslations('core');
  const notes = useTranslations('notes');
  const blocks = useTranslations('blocks');
  const locale = useLocale();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query.trim()), 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  const posts = useNotesSearch({
    locale: locale === 'vi' ? 'vi' : 'en',
    params: { q: debounced || undefined, pageSize: 5, sort: '-publishedAt' },
    enabled: open && Boolean(debounced),
  });

  const needle = query.trim().toLowerCase();
  const matches = (label: string) => !needle || label.toLowerCase().includes(needle);
  const close = () => onOpenChange(false);
  const otherLocale = locale === 'en' ? 'vi' : 'en';

  const actions: { label: string; node: ReactNode }[] = [
    ...(resumeUrl
      ? [
          {
            label: blocks('downloadCv'),
            node: (
              <a href={resumeUrl} className={ITEM} onClick={close}>
                {blocks('downloadCv')}
              </a>
            ),
          },
        ]
      : []),
    ...(email
      ? [
          {
            label: t('copyEmail'),
            node: (
              <button
                type="button"
                className={ITEM}
                onClick={async () => {
                  await navigator.clipboard.writeText(email);
                  setCopied(true);
                }}
              >
                {copied ? t('copied') : t('copyEmail')}
              </button>
            ),
          },
        ]
      : []),
    {
      label: t('toggleTheme'),
      node: (
        <button
          type="button"
          className={ITEM}
          onClick={() => {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
            close();
          }}
        >
          {t('toggleTheme')}
        </button>
      ),
    },
    {
      label: t('switchLanguage'),
      node: (
        <Link
          href={pathname}
          locale={otherLocale}
          className={cn(ITEM, 'flex items-center justify-between gap-2')}
          onClick={close}
        >
          {t('switchLanguage')}
          <span className="text-meta text-muted-foreground font-mono">
            {otherLocale.toUpperCase()}
          </span>
        </Link>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onCloseAutoFocus={onCloseAutoFocus}
        className="flex max-h-[85dvh] flex-col gap-3"
      >
        <DialogTitle>{t('command')}</DialogTitle>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={notes('search')}
          aria-label={notes('search')}
        />
        <div className="-mx-2 flex min-h-0 flex-col gap-2 overflow-y-auto">
          {debounced && posts.data?.items.length ? (
            <PaletteGroup label={notes('title')}>
              {posts.data.items.map((post) => (
                <Link key={post.id} href={`/notes/${post.slug}`} className={ITEM} onClick={close}>
                  {post.title}
                </Link>
              ))}
            </PaletteGroup>
          ) : null}
          <PaletteGroup label={t('paletteGoTo')}>
            {nav
              .filter((item) => matches(item.label))
              .map((item) => (
                <Link key={item.id} href={item.href} className={ITEM} onClick={close}>
                  {item.label}
                </Link>
              ))}
          </PaletteGroup>
          <PaletteGroup label={t('paletteCaseStudies')}>
            {caseStudies
              .filter((study) => matches(study.title))
              .map((study) => (
                <Link
                  key={study.slug}
                  href={`/projects/${study.slug}`}
                  className={ITEM}
                  onClick={close}
                >
                  {study.title}
                </Link>
              ))}
          </PaletteGroup>
          <PaletteGroup label={t('paletteActions')}>
            {actions.filter((action) => matches(action.label)).map((action) => action.node)}
          </PaletteGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
