'use client';

import type { PublicNavItem } from '@portfolio/contracts';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Link, usePathname } from '@i18n/navigation';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@portfolio/ui/components/ui/segmented-control';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@portfolio/ui/components/ui/sheet';
import { useCloseOnNavigate } from '@portfolio/ui/hooks/use-close-on-navigate.hook';
import { cn } from '@portfolio/ui/lib/utils';

import { CommandPalette } from '../CommandPalette/CommandPalette';
import { LocaleSwitch } from '../LocaleSwitch/LocaleSwitch';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

export function SiteHeader({
  name,
  nav,
  resumeUrl,
}: {
  name: string;
  nav: PublicNavItem[];
  resumeUrl?: string;
}) {
  const t = useTranslations('core');
  const tBlocks = useTranslations('blocks');
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const menu = useCloseOnNavigate(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = matchMedia('(min-width: 768px)');
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

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
              className="tap text-ui text-muted-foreground hover:text-foreground inline-flex items-center px-2 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {desktop ? <CommandPalette nav={nav} /> : null}
          <LocaleSwitch />
          <ThemeToggle />
        </div>
        <div className="ml-auto md:hidden">
          <Sheet open={menu.open} onOpenChange={menu.onOpenChange}>
            <SheetTrigger asChild>
              <Button surface="public" variant="outline" size="sm" aria-label={t('menu')}>
                <Menu className="size-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="mobile-menu-sheet">
              <div className="mobile-menu-heading">
                <SheetTitle>{t('menu')}</SheetTitle>
                <SheetClose asChild>
                  <Button surface="public" variant="outline" size="sm" aria-label={t('close')}>
                    <X className="size-4" aria-hidden />
                  </Button>
                </SheetClose>
              </div>
              <nav className="mobile-menu-nav" aria-label={t('menu')}>
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
                      className="mobile-menu-link text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mobile-menu-bottom">
                <div className="mobile-menu-setting">
                  <span>{t('locale')}</span>
                  <LocaleSwitch />
                </div>
                <div className="mobile-menu-setting">
                  <span>{t('theme')}</span>
                  <SegmentedControl aria-label={t('theme')} variant="equal">
                    {(
                      [
                        ['light', t('themeLight')],
                        ['dark', t('themeDark')],
                        ['system', t('themeAuto')],
                      ] as const
                    ).map(([value, label]) => (
                      <SegmentedControlItem
                        key={value}
                        type="button"
                        data-state={theme === value ? 'on' : 'off'}
                        aria-pressed={theme === value}
                        onClick={() => setTheme(value)}
                      >
                        {label}
                      </SegmentedControlItem>
                    ))}
                  </SegmentedControl>
                </div>
                <div className="mobile-menu-actions">
                  {resumeUrl ? (
                    <Button surface="public" variant="outline" asChild>
                      <a href={resumeUrl}>{tBlocks('downloadCv')}</a>
                    </Button>
                  ) : null}
                  <SheetClose asChild>
                    <Button surface="public" asChild>
                      <Link href="/contact">{t('contact')}</Link>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
