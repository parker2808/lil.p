import { Be_Vietnam_Pro, Inter, JetBrains_Mono } from 'next/font/google';

// Google's `vietnamese` subset includes Latin + Vietnamese diacritics.
// Using only that subset keeps the network panel at ≤ 5 files
// (Be Vietnam 600/700, Inter variable, JetBrains 400/600).
// next/font requires a literal array — no spread.
export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export const inter = Inter({
  subsets: ['vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  adjustFontFallback: true,
});

export const fontClassName = `${beVietnamPro.variable} ${inter.variable} ${jetbrainsMono.variable}`;
