export type TenantBrand = 'neutral' | 'lilp';

export function tenantBrand(host: string | null, siteUrl: string | undefined): TenantBrand {
  if (!host || !siteUrl) return 'neutral';
  try {
    return new URL(`http://${host}`).hostname.toLowerCase() ===
      new URL(siteUrl).hostname.toLowerCase()
      ? 'lilp'
      : 'neutral';
  } catch {
    return 'neutral';
  }
}
