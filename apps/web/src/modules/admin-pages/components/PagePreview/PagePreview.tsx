'use client';

import type { PageKey } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import {
  draftPreviewSrc,
  postPreviewMessage,
  PREVIEW_VIEWPORTS,
} from '../../utils/preview-frame.util';

export function PagePreview({
  pageKey,
  locale,
  version,
  frameRef,
  refreshToken,
  focusId,
}: {
  pageKey: PageKey;
  locale: 'en' | 'vi';
  version?: number;
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  refreshToken: number;
  focusId: number | null;
}) {
  const t = useTranslations('admin.pages.preview');
  const [width, setWidth] = useState<(typeof PREVIEW_VIEWPORTS)[number]>(1440);
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }
    const measure = () => {
      const available = shell.clientWidth;
      setScale(available > 0 ? Math.min(1, available / width) : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    postPreviewMessage(frameRef.current, { type: 'preview:refresh' });
  }, [frameRef, refreshToken]);

  useEffect(() => {
    if (focusId !== null) {
      postPreviewMessage(frameRef.current, { type: 'preview:focus', blockId: focusId });
    }
  }, [focusId, frameRef]);

  return (
    <div className="bg-muted flex flex-col gap-3 rounded-md p-3">
      <div className="flex flex-wrap gap-2">
        {PREVIEW_VIEWPORTS.map((size) => (
          <Button
            key={size}
            type="button"
            size="sm"
            variant={width === size ? 'default' : 'outline'}
            onClick={() => setWidth(size)}
          >
            {t('viewport', { width: size })}
          </Button>
        ))}
      </div>
      <div ref={shellRef} className="overflow-hidden">
        <div
          className="bg-background origin-top-left"
          style={{
            width,
            height: 720,
            transform: `scale(${scale})`,
          }}
        >
          <iframe
            ref={frameRef}
            title={t('title')}
            src={draftPreviewSrc(pageKey, locale, version)}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
