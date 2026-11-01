import type { PublicNavItem } from '@portfolio/contracts';

export function footerSitemap(header: PublicNavItem[], footer: PublicNavItem[]): PublicNavItem[] {
  const seen = new Set<string>();
  return [...header, ...footer].filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}
