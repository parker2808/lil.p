'use client';

import type { PublicNavItem } from '@portfolio/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link, usePathname } from '@i18n/navigation';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@portfolio/ui/components/ui/dialog';
import { Kbd } from '@portfolio/ui/components/ui/kbd';
import { useTheme } from 'next-themes';

const META = '⌘';
const KEY = 'K';
const EN = 'EN';
const VI = 'VI';

export function CommandPalette({ nav }: { nav: PublicNavItem[] }) {
  const t = useTranslations('core');
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t('command')}>
          <Kbd>{META}</Kbd>
          <Kbd>{KEY}</Kbd>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('command')}</DialogTitle>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="text-ui hover:bg-accent rounded-md px-2 py-2"
              onClick={() => setOpen(false)}
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
            onClick={() => setOpen(false)}
          >
            {EN}
          </Link>
          <Link
            href={pathname}
            locale="vi"
            className="text-ui hover:bg-accent rounded-md px-2 py-2"
            onClick={() => setOpen(false)}
          >
            {VI}
          </Link>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
