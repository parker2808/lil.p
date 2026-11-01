import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { AdminProviders } from '@/modules/core/components/Providers/AdminProviders';
import { fontClassName } from '@/modules/core/utils/fonts.util';
import { requestNonce } from '@/modules/core/utils/request-nonce.util';

import en from '../../i18n/locales/en.json';
import vi from '../../i18n/locales/vi.json';
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
  const locale = (await cookies()).get('NEXT_LOCALE')?.value === 'vi' ? 'vi' : 'en';
  return (
    <html lang={locale} className={fontClassName} suppressHydrationWarning>
      <body className="admin bg-background text-ui text-foreground min-h-dvh font-sans antialiased">
        <AdminProviders
          locale={locale}
          messages={locale === 'vi' ? { ...en, ...vi } : en}
          nonce={nonce}
        >
          {children}
        </AdminProviders>
      </body>
    </html>
  );
}
