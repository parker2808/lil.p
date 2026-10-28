import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

export const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-plex-sans',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: false,
  variable: '--font-plex-mono',
});

export const fontClassName = `${plexSans.variable} ${plexMono.variable}`;
