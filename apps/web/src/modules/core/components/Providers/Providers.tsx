'use client';

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
    <NextIntlClientProvider locale={locale} messages={messages}>
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
