'use client';

import { APP_TIME_ZONE } from '@i18n/timezone';
import type { AbstractIntlMessages } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { ApiWarmup } from '../ApiWarmup/ApiWarmup';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export function Providers({
  children,
  locale,
  messages,
  nonce,
}: {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  nonce?: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={APP_TIME_ZONE}>
      <QueryProvider>
        <ThemeProvider nonce={nonce}>
          <ApiWarmup />
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
