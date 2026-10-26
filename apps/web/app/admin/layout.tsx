import type { ReactNode } from 'react';

import { Providers } from '@/modules/core/components/Providers/Providers';
import { fontClassName } from '@/modules/core/utils/fonts.util';
import { requestNonce } from '@/modules/core/utils/request-nonce.util';

import en from '../../i18n/locales/en.json';
import '../globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: {
    default: 'Admin',
    template: '%s · Admin',
  },
};

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const nonce = await requestNonce();
  return (
    <html lang="en" className={fontClassName} suppressHydrationWarning>
      <body className="bg-background text-ui text-foreground min-h-dvh font-sans antialiased">
        <Providers locale="en" messages={en} nonce={nonce}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
