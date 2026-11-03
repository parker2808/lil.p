'use client';

import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FileText } from 'lucide-react';
import { useRef, useSyncExternalStore } from 'react';

export type MediaLibraryItem = {
  id: number;
  url: string;
  srcset?: string;
  alt: string;
  originalName: string;
  mimeType: string;
  missingAlt?: boolean;
};

function subscribeViewport(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function viewportWidth() {
  return window.innerWidth;
}

export function CollectionMediaLibrary({
  items,
  selectedId,
  onSelect,
  labels,
  className,
}: {
  items: MediaLibraryItem[];
  selectedId?: number | null;
  onSelect?: (item: MediaLibraryItem) => void;
  labels: { missingAlt: string; empty: string; pdf: string };
  className?: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const width = useSyncExternalStore(subscribeViewport, viewportWidth, () => 390);
  const columns = width >= 1024 ? 4 : width >= 640 ? 3 : 2;
  const rowHeight = columns === 3 ? 210 : columns === 4 ? 184 : 168;
  const rowCount = Math.max(1, Math.ceil(items.length / columns));
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 4,
    // First paint (and jsdom) has no ResizeObserver measurement yet; h-96 is 384px.
    initialRect: { width: 800, height: 384 },
  });

  if (items.length === 0) {
    return <p className="text-ui text-muted-foreground">{labels.empty}</p>;
  }

  return (
    <div ref={parentRef} data-slot="media-library" className={cn('h-96 overflow-auto', className)}>
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => {
          const start = row.index * columns;
          const slice = items.slice(start, start + columns);
          return (
            <div
              key={row.key}
              className={cn(
                'absolute top-0 left-0 grid w-full gap-2 px-0.5',
                columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2',
              )}
              style={{ transform: `translateY(${row.start}px)` }}
            >
              {slice.map((item) => {
                const selected = item.id === selectedId;
                const isPdf = item.mimeType === 'application/pdf';
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                      'border-border bg-card flex min-w-0 flex-col gap-2 overflow-hidden rounded-xl border p-2 text-left',
                      selected && 'ring-primary ring-2',
                    )}
                    onClick={() => onSelect?.(item)}
                  >
                    <div
                      data-media-art
                      className="bg-muted relative aspect-video overflow-hidden rounded-lg"
                    >
                      {isPdf ? (
                        <div className="text-muted-foreground flex size-full items-center justify-center">
                          <FileText className="size-6" aria-hidden />
                          <span className="sr-only">{labels.pdf}</span>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          srcSet={item.srcset}
                          alt={item.alt || item.originalName}
                          sizes="160px"
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col items-start gap-1">
                      <span
                        className="text-ui-meta line-clamp-2 break-words"
                        title={item.originalName}
                      >
                        {item.originalName}
                      </span>
                      {item.missingAlt ? (
                        <Badge variant="warning" className="max-w-full shrink-0 whitespace-nowrap">
                          {labels.missingAlt}
                        </Badge>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
