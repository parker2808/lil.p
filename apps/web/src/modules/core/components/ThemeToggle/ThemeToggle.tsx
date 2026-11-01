'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

import { cn } from '@portfolio/ui/lib/utils';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@portfolio/ui/components/ui/segmented-control';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@portfolio/ui/components/ui/dropdown-menu';

export function ThemeToggle() {
  const t = useTranslations('core');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const OPTIONS = [
    { value: 'light', label: t('themeLight'), icon: Sun },
    { value: 'dark', label: t('themeDark'), icon: Moon },
    { value: 'system', label: t('themeSystem'), icon: Monitor },
  ] as const;
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  function changeTheme(value: string) {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (
      !document.startViewTransition ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      saveData
    ) {
      setTheme(value);
      return;
    }
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(value));
    });
    void transition.ready.catch(() => undefined);
  }

  const current = theme ?? 'system';
  const TriggerIcon = mounted && resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'border-border bg-card text-foreground inline-flex size-10 items-center justify-center rounded-md border',
          'hover:border-border-strong hover:bg-accent',
        )}
        aria-label={t('theme')}
      >
        {mounted ? (
          <TriggerIcon className="size-4" aria-hidden />
        ) : (
          <Sun className="size-4" aria-hidden />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <SegmentedControl asChild variant="equal">
          <DropdownMenuRadioGroup value={current} onValueChange={changeTheme}>
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <SegmentedControlItem asChild key={value}>
                <DropdownMenuRadioItem
                  value={value}
                  data-state={current === value ? 'on' : 'off'}
                  aria-pressed={current === value}
                  className="gap-1 rounded-none px-2"
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </DropdownMenuRadioItem>
              </SegmentedControlItem>
            ))}
          </DropdownMenuRadioGroup>
        </SegmentedControl>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
