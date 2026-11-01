'use client';

import type { PublicNavItem } from '@portfolio/contracts';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { type ComponentProps, useEffect, useState } from 'react';

import { Button } from '@portfolio/ui/components/ui/button';
import { Kbd } from '@portfolio/ui/components/ui/kbd';

const META = '⌘';
const KEY = 'K';

const loadDialog = () => import('./CommandPaletteDialog');

const CommandPaletteDialog = dynamic(
  () => loadDialog().then((module) => module.CommandPaletteDialog),
  { ssr: false, loading: () => <CommandPaletteButton /> },
);

function CommandPaletteButton(props: ComponentProps<'button'>) {
  const t = useTranslations('core');
  return (
    <Button
      surface="public"
      variant="outline"
      size="sm"
      aria-label={`${t('command')} ${META}${KEY}`}
      {...props}
    >
      <Kbd>{META}</Kbd>
      <Kbd>{KEY}</Kbd>
    </Button>
  );
}

export function CommandPalette({ nav }: { nav: PublicNavItem[] }) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setLoaded(true);
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!loaded) {
    const preload = () => void loadDialog();
    return (
      <CommandPaletteButton
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
      />
    );
  }

  return (
    <CommandPaletteDialog
      nav={nav}
      open={open}
      onOpenChange={setOpen}
      trigger={<CommandPaletteButton />}
    />
  );
}
