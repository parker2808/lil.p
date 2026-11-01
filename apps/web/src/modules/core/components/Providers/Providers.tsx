'use client';

import { APP_TIME_ZONE } from '@i18n/timezone';
import type { AbstractIntlMessages } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { type ReactNode, useEffect } from 'react';

import { ApiWarmup } from '../ApiWarmup/ApiWarmup';
import { NavigationProgress } from '../NavigationProgress/NavigationProgress';
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
  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          addEventListener?: (type: string, listener: () => void) => void;
          removeEventListener?: (type: string, listener: () => void) => void;
        };
      }
    ).connection;
    const sync = () =>
      document.documentElement.toggleAttribute('data-save-data', Boolean(connection?.saveData));
    sync();
    connection?.addEventListener?.('change', sync);
    return () => connection?.removeEventListener?.('change', sync);
  }, []);
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={APP_TIME_ZONE}>
      <ThemeProvider nonce={nonce}>
        <ApiWarmup />
        <NavigationProgress />
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
