'use client';

import type { AbstractIntlMessages } from 'next-intl';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { Providers } from './Providers';
import { QueryProvider } from './QueryProvider';

export function AdminProviders({
  children,
  locale = 'en',
  messages,
  nonce,
}: {
  children: ReactNode;
  locale?: 'en' | 'vi';
  messages: AbstractIntlMessages;
  nonce?: string;
}) {
  return (
    <Providers locale={locale} messages={messages} nonce={nonce}>
      <QueryProvider>
        {children}
        <Toaster position="bottom-right" duration={4000} />
      </QueryProvider>
    </Providers>
  );
}
