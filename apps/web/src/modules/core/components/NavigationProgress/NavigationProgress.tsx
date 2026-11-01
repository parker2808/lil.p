'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useState } from 'react';

/** A plain left click on a same-origin link to another path or query; hash-only links stay put. */
export function isNavigationClick(event: MouseEvent, current: URL): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  ) {
    return false;
  }
  const anchor = event.target.closest('a[href]');
  if (
    !(anchor instanceof HTMLAnchorElement) ||
    (anchor.target && anchor.target !== '_self') ||
    anchor.hasAttribute('download')
  ) {
    return false;
  }
  const next = new URL(anchor.href, current);
  return (
    next.origin === current.origin &&
    (next.pathname !== current.pathname || next.search !== current.search)
  );
}

function Progress() {
  const location = `${usePathname()}?${useSearchParams().toString()}`;
  const t = useTranslations('core');
  const [pending, setPending] = useState(false);
  const [settled, setSettled] = useState(location);
  if (settled !== location) {
    setSettled(location);
    setPending(false);
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isNavigationClick(event, new URL(window.location.href))) {
        setPending(true);
      }
    };
    const onPageShow = () => setPending(false);
    document.addEventListener('click', onClick, true);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  return pending ? (
    <div className="route-pending" role="status">
      <span className="sr-only">{t('loading')}</span>
    </div>
  ) : null;
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <Progress />
    </Suspense>
  );
}
