'use client';

import { Moon, Sun } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { type ComponentProps, useState, useSyncExternalStore } from 'react';

import { cn } from '@portfolio/ui/lib/utils';

const loadThemeMenu = () => import('./ThemeMenu');

const ThemeMenu = dynamic(() => loadThemeMenu().then((module) => module.ThemeMenu), {
  ssr: false,
  loading: () => <ThemeButton />,
});

function ThemeButton({ className, ...props }: ComponentProps<'button'>) {
  const t = useTranslations('core');
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const Icon = mounted && resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <button
      type="button"
      className={cn(
        'border-border bg-card text-foreground inline-flex size-10 items-center justify-center rounded-md border',
        'hover:border-border-strong hover:bg-accent',
        className,
      )}
      aria-label={t('theme')}
      {...props}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

export function ThemeToggle() {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    const preload = () => void loadThemeMenu();
    return (
      <ThemeButton onPointerEnter={preload} onFocus={preload} onClick={() => setLoaded(true)} />
    );
  }

  return <ThemeMenu trigger={<ThemeButton />} />;
}
