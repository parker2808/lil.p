import type { ReactNode } from 'react';
import { headers } from 'next/headers';

import { fontClassName } from '@/modules/core/utils/fonts.util';

import '@/modules/core/styles/brand.css';

import './demo.css';
import './round2.css';

export const metadata = { title: 'Admin design demo · lil.p' };

export default async function DemoLayout({ children }: { children: ReactNode }) {
  const locale = (await headers()).get('x-demo-locale') === 'vi' ? 'vi' : 'en';
  return (
    <html lang={locale} className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
