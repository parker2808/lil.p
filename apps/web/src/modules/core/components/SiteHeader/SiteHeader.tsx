'use client';

import type { PublicNavItem } from '@portfolio/contracts';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link } from '@i18n/navigation';
import { Button } from '@portfolio/ui/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@portfolio/ui/components/ui/sheet';
import { cn } from '@portfolio/ui/lib/utils';

import { CommandPalette } from '../CommandPalette/CommandPalette';
import { LocaleSwitch } from '../LocaleSwitch/LocaleSwitch';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

export function SiteHeader({ name, nav }: { name: string; nav: PublicNavItem[] }) {
  const t = useTranslations('core');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'bg-background/80 z-header sticky top-0 backdrop-blur-md',
        scrolled && 'shadow-1',
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-6">
        <Link href="/" className="font-heading text-ui font-semibold">
          {name}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              data-slot="nav-link"
              className="text-ui text-muted-foreground hover:text-foreground inline-flex h-8 items-center px-2 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <CommandPalette nav={nav} />
          <LocaleSwitch />
          <ThemeToggle />
        </div>
        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" aria-label={t('menu')}>
                <Menu className="size-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle>{t('menu')}</SheetTitle>
              <nav className="flex flex-col gap-2">
                {nav.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    data-slot="nav-link"
                    className="text-ui text-muted-foreground hover:text-foreground inline-flex h-8 items-center px-2 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <LocaleSwitch />
              <ThemeToggle />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
