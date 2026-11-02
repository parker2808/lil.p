'use client';

import { MoveUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function DemoLanguageSwitch({ locale }: { locale: 'en' | 'vi' }) {
  const pathname = usePathname();
  const other = locale === 'en' ? 'vi' : 'en';
  const href = pathname.replace(/^\/(en|vi)(?=\/|$)/, `/${other}`);
  return (
    <a
      className="demo-language"
      href={href}
      aria-label={locale === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
    >
      {other.toUpperCase()} <MoveUpRight size={12} aria-hidden />
    </a>
  );
}
