import type { ReactNode } from 'react';

import { AdminProviders } from '@/modules/core/components/Providers/AdminProviders';
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
      <body className="admin bg-background text-ui text-foreground min-h-dvh font-sans antialiased">
        <AdminProviders messages={en} nonce={nonce}>
          {children}
        </AdminProviders>
      </body>
    </html>
  );
}
