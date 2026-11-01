'use client';

import type { PublicNavItem } from '@portfolio/contracts';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link, usePathname } from '@i18n/navigation';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@portfolio/ui/components/ui/sheet';
import { useCloseOnNavigate } from '@portfolio/ui/hooks/use-close-on-navigate.hook';
import { cn } from '@portfolio/ui/lib/utils';

import { RoutePending } from '../RoutePending/RoutePending';
import { CommandPalette } from '../CommandPalette/CommandPalette';
import { LocaleSwitch } from '../LocaleSwitch/LocaleSwitch';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

export function SiteHeader({ name, nav }: { name: string; nav: PublicNavItem[] }) {
  const t = useTranslations('core');
  const pathname = usePathname();
  const menu = useCloseOnNavigate(pathname);
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
        'site-header bg-background/90 z-header sticky top-0 border-b backdrop-blur-md',
        scrolled && 'shadow-1',
      )}
    >
      <div className="site-container mx-auto flex h-16 items-center gap-6">
        <Link
          href="/"
          className="font-heading text-ui inline-flex items-center gap-3 font-semibold"
        >
          <span className="site-monogram" aria-hidden>
            {name.slice(0, 1)}
          </span>
          {name}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(`${item.href}/`))
                  ? 'page'
                  : undefined
              }
              data-slot="nav-link"
              className="text-ui text-muted-foreground hover:text-foreground inline-flex h-8 items-center px-2 transition-colors"
            >
              {item.label}
              <RoutePending />
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <CommandPalette nav={nav} />
          <LocaleSwitch />
          <ThemeToggle />
        </div>
        <div className="ml-auto md:hidden">
          <Sheet open={menu.open} onOpenChange={menu.onOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" aria-label={t('menu')}>
                <Menu className="size-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle>{t('menu')}</SheetTitle>
              <nav className="flex flex-col gap-2">
                {nav.map((item) => (
                  <SheetClose asChild key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={
                        pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(`${item.href}/`))
                          ? 'page'
                          : undefined
                      }
                      data-slot="nav-link"
                      className="text-ui text-muted-foreground hover:text-foreground inline-flex h-8 items-center px-2 transition-colors"
                    >
                      {item.label}
                      <RoutePending />
                    </Link>
                  </SheetClose>
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
