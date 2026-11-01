'use client';

import type { AdminMedia } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { useState } from 'react';

import { MediaPickerDialog } from '../MediaPickerDialog/MediaPickerDialog';

export function MediaField({
  label,
  value,
  accept,
  readOnly,
  chooseLabel,
  clearLabel,
  emptyLabel,
  onChange,
}: {
  label: string;
  value: { id: number; url: string; originalName: string; mimeType: string } | null;
  accept?: 'image' | 'pdf' | 'any';
  readOnly?: boolean;
  chooseLabel: string;
  clearLabel: string;
  emptyLabel: string;
  onChange: (media: AdminMedia | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const isImage = value?.mimeType.startsWith('image/');

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {value ? (
        <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-2">
          {isImage ? (
            // Native img: admin thumbnail of a Cloudinary/public-media URL, not next/image.
            // eslint-disable-next-line @next/next/no-img-element -- picker preview
            <img
              src={value.url}
              alt={value.originalName}
              className="size-14 rounded-md object-cover"
            />
          ) : (
            <p className="text-ui-meta truncate" title={value.originalName}>
              {value.originalName}
            </p>
          )}
          {readOnly ? null : (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              {clearLabel}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-ui-meta text-muted-foreground">{emptyLabel}</p>
      )}
      {readOnly ? null : (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            {chooseLabel}
          </Button>
          <MediaPickerDialog
            open={open}
            accept={accept}
            onOpenChange={setOpen}
            onPick={(media) => onChange(media)}
          />
        </>
      )}
    </Field>
  );
}
