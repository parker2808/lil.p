'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { inputClassName } from '@portfolio/ui/components/ui/input';
import { Kbd } from '@portfolio/ui/components/ui/kbd';
import { cn } from '@portfolio/ui/lib/utils';

import { openCommandPalette } from './command-palette.event';

const SHORTCUT = '⌘K';

/** Looks like a search input; opens the ⌘K palette, which holds the real search box. */
export function PaletteSearchField() {
  const t = useTranslations('core');
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      className={cn(
        inputClassName,
        'text-muted-foreground h-10 items-center gap-2 text-left pointer-coarse:h-11',
      )}
      onClick={openCommandPalette}
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{t('searchSite')}</span>
      <Kbd aria-hidden className="hidden sm:inline">
        {SHORTCUT}
      </Kbd>
    </button>
  );
}
