'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function PreviewBridge() {
  const router = useRouter();

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }
      const data = event.data as { type?: string; blockId?: number } | null;
      if (!data || typeof data !== 'object') {
        return;
      }
      if (data.type === 'preview:refresh') {
        const top = window.scrollY;
        router.refresh();
        requestAnimationFrame(() => {
          window.scrollTo(0, top);
        });
        return;
      }
      if (data.type === 'preview:focus' && data.blockId != null) {
        const target = document.querySelector(`[data-block-id="${data.blockId}"]`);
        if (!(target instanceof HTMLElement)) {
          return;
        }
        target.scrollIntoView({ block: 'center' });
        target.classList.add('ring-2', 'ring-ring');
        window.setTimeout(() => target.classList.remove('ring-2', 'ring-ring'), 1600);
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router]);

  return null;
}
