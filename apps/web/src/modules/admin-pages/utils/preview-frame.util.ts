import type { PageKey } from '@portfolio/contracts';

export const PREVIEW_VIEWPORTS = [390, 768, 1440] as const;

export function publicPagePath(pageKey: PageKey, locale: 'en' | 'vi', version?: number): string {
  const base = pageKey === 'home' ? `/${locale}` : `/${locale}/${pageKey}`;
  return version ? `${base}?v=${version}` : base;
}

export function draftPreviewSrc(pageKey: PageKey, locale: 'en' | 'vi', version?: number): string {
  if (version) {
    return publicPagePath(pageKey, locale, version);
  }
  return `/api/draft?path=${encodeURIComponent(publicPagePath(pageKey, locale))}`;
}

export function postPreviewMessage(
  frame: HTMLIFrameElement | null,
  message: { type: 'preview:refresh' } | { type: 'preview:focus'; blockId: number },
): void {
  const target = frame?.contentWindow;
  if (!target) {
    return;
  }
  target.postMessage(message, window.location.origin);
}
