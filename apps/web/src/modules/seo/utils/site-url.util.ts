export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function metadataBase(): URL {
  return new URL(siteUrl());
}

export function localePath(locale: string, path: string): string {
  const suffix = path === '/' ? '' : path;
  return `/${locale}${suffix}`;
}

export function absoluteUrl(locale: string, path: string): string {
  return `${siteUrl()}${localePath(locale, path)}`;
}
