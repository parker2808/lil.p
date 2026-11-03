'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

export function PublicToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      duration={4000}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  );
}
