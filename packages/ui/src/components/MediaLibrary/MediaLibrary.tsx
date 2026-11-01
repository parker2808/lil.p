'use client';

import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FileText } from 'lucide-react';
import { useRef } from 'react';

export type MediaLibraryItem = {
  id: number;
  url: string;
  srcset?: string;
  alt: string;
  originalName: string;
  mimeType: string;
  missingAlt?: boolean;
};

const COLUMNS = 4;
const ROW_HEIGHT = 168;

export function MediaLibrary({
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
  const rowCount = Math.max(1, Math.ceil(items.length / COLUMNS));
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
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
          const start = row.index * COLUMNS;
          const slice = items.slice(start, start + COLUMNS);
          return (
            <div
              key={row.key}
              className="absolute top-0 left-0 grid w-full grid-cols-4 gap-2 px-0.5"
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
                      'border-border bg-card flex flex-col overflow-hidden rounded-xl border text-left',
                      selected && 'ring-primary ring-2',
                    )}
                    onClick={() => onSelect?.(item)}
                  >
                    <div className="bg-muted relative aspect-video overflow-hidden">
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
                    <div className="flex items-start justify-between gap-1 p-2">
                      <span className="text-ui-meta line-clamp-2" title={item.originalName}>
                        {item.originalName}
                      </span>
                      {item.missingAlt ? (
                        <Badge variant="warning" className="shrink-0">
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
