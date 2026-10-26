import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ThemeProvider } from '@/modules/core/components/Providers/ThemeProvider';
import { ThemeToggle } from '@/modules/core/components/ThemeToggle/ThemeToggle';
import { fontClassName } from '@/modules/core/utils/fonts.util';

import './globals.css';

export const metadata: Metadata = {
  title: 'Foundations specimen',
  description: 'Temporary type and token specimen. Removed in T11.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontClassName} suppressHydrationWarning>
      <body className="bg-background text-body text-foreground min-h-dvh font-sans antialiased">
        <ThemeProvider>
          <div className="flex justify-end px-6 py-4">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
