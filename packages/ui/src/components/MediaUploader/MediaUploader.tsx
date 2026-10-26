'use client';

import { Button } from '@portfolio/ui/components/ui/button';
import { Progress } from '@portfolio/ui/components/ui/progress';
import { cn } from '@portfolio/ui/lib/utils';
import { type ChangeEvent, type DragEvent, useId, useState } from 'react';

export type MediaUploadStatus = 'uploading' | 'done' | 'error' | 'cancelled';

export type MediaUploadItem = {
  id: string;
  name: string;
  progress: number;
  status: MediaUploadStatus;
  error?: string;
};

export function MediaUploader({
  items,
  accept,
  disabled,
  labels,
  onFiles,
  onCancel,
  className,
}: {
  items: MediaUploadItem[];
  accept?: string;
  disabled?: boolean;
  labels: {
    drop: string;
    browse: string;
    cancel: string;
    uploading: string;
    done: string;
    error: string;
    cancelled: string;
  };
  onFiles: (files: File[]) => void;
  onCancel: (id: string) => void;
  className?: string;
}) {
  const inputId = useId();
  const [over, setOver] = useState(false);

  function takeFiles(list: FileList | null) {
    if (!list || list.length === 0) {
      return;
    }
    onFiles(Array.from(list));
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setOver(false);
    if (!disabled) {
      takeFiles(event.dataTransfer.files);
    }
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (!disabled) {
      setOver(true);
    }
  }

  return (
    <div data-slot="media-uploader" className={cn('flex flex-col gap-3', className)}>
      <label
        htmlFor={inputId}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setOver(false)}
        className={cn(
          'border-border bg-muted/40 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center',
          over && 'border-primary bg-primary-subtle',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <span className="text-ui">{labels.drop}</span>
        <span className="text-ui-meta text-muted-foreground">{labels.browse}</span>
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            takeFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </label>
      {items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-ui-meta truncate">{item.name}</p>
                {item.status === 'uploading' ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => onCancel(item.id)}>
                    {labels.cancel}
                  </Button>
                ) : (
                  <span className="text-ui-meta text-muted-foreground">
                    {item.status === 'done'
                      ? labels.done
                      : item.status === 'cancelled'
                        ? labels.cancelled
                        : (item.error ?? labels.error)}
                  </span>
                )}
              </div>
              <Progress value={item.progress} aria-label={`${labels.uploading} ${item.name}`} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
