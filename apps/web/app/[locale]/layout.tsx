import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Providers } from '@/modules/core/components/Providers/Providers';
import { fontClassName } from '@/modules/core/utils/fonts.util';
import { requestNonce } from '@/modules/core/utils/request-nonce.util';
import { localeStaticParams } from '@/modules/core/utils/static-params.util';
import { metadataBase } from '@/modules/seo/utils/site-url.util';

import { routing } from '../../i18n/routing';

import '../globals.css';

export const metadata: Metadata = {
  metadataBase: metadataBase(),
};

export const generateStaticParams = localeStaticParams;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const { admin: _admin, ...messages } = await getMessages();
  const nonce = (await draftMode()).isEnabled ? await requestNonce() : undefined;

  return (
    <html lang={locale} className={fontClassName} suppressHydrationWarning>
      <body className="bg-background text-body text-foreground min-h-dvh font-sans antialiased">
        <Providers locale={locale} messages={messages} nonce={nonce}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
