import type { ReactNode } from 'react';

import { fontClassName } from '@/modules/core/utils/fonts.util';

import './demo.css';

export const metadata = { title: 'Admin design demo · lil.p' };

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
