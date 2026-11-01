'use client';

import type { PublicNavItem } from '@portfolio/contracts';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@portfolio/ui/components/ui/button';
import { Kbd } from '@portfolio/ui/components/ui/kbd';

import { OPEN_COMMAND_PALETTE } from './command-palette.event';

const META = '⌘';
const KEY = 'K';

export type PaletteCaseStudy = { slug: string; title: string };

const loadDialog = () => import('./CommandPaletteDialog');

const CommandPaletteDialog = dynamic(
  () => loadDialog().then((module) => module.CommandPaletteDialog),
  { ssr: false },
);

export function CommandPalette({
  nav,
  caseStudies,
  email,
  resumeUrl,
  compact,
}: {
  nav: PublicNavItem[];
  caseStudies: PaletteCaseStudy[];
  email?: string;
  resumeUrl?: string;
  /** Renders the mobile search icon instead of the ⌘K button. */
  compact: boolean;
}) {
  const t = useTranslations('core');
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setLoaded(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          show();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_COMMAND_PALETTE, show);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_COMMAND_PALETTE, show);
    };
  }, [open, show]);

  const preload = () => void loadDialog();
  const triggerProps = {
    ref: trigger,
    surface: 'public',
    variant: 'outline',
    size: 'sm',
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    onPointerEnter: preload,
    onFocus: preload,
    onClick: show,
  } as const;

  return (
    <>
      {compact ? (
        <Button {...triggerProps} aria-label={t('search')}>
          <Search className="size-4" aria-hidden />
        </Button>
      ) : (
        <Button {...triggerProps} aria-label={`${t('command')} ${META}${KEY}`}>
          <Kbd>{META}</Kbd>
          <Kbd>{KEY}</Kbd>
        </Button>
      )}
      {loaded ? (
        <CommandPaletteDialog
          nav={nav}
          caseStudies={caseStudies}
          email={email}
          resumeUrl={resumeUrl}
          open={open}
          onOpenChange={setOpen}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = opener.current;
            (target?.isConnected && target !== document.body ? target : trigger.current)?.focus();
          }}
        />
      ) : null}
    </>
  );
}
