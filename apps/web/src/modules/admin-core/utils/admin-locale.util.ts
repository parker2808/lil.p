export function switchAdminLocale(locale: string): void {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
  window.location.reload();
}
