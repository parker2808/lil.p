'use client';

import type { AdminMedia } from '@portfolio/contracts';
import { MediaLibrary } from '@portfolio/ui/components/MediaLibrary/MediaLibrary';
import { MediaUploader } from '@portfolio/ui/components/MediaUploader/MediaUploader';
import { Button } from '@portfolio/ui/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@portfolio/ui/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { flattenMediaPages, useAdminMediaList } from '../../hooks/use-admin-media.hook';
import { useMediaUpload } from '../../hooks/use-media-upload.hook';

export function MediaPickerDialog({
  open,
  accept,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  accept?: 'image' | 'pdf' | 'any';
  onOpenChange: (open: boolean) => void;
  onPick: (media: AdminMedia) => void;
}) {
  const t = useTranslations('admin.media');
  const list = useAdminMediaList();
  const upload = useMediaUpload((media) => {
    onPick(media);
    onOpenChange(false);
  });
  const [selected, setSelected] = useState<AdminMedia | null>(null);

  const items = useMemo(() => {
    const all = flattenMediaPages(list.data?.pages);
    return all
      .filter((item) => {
        if (accept === 'pdf') {
          return item.mimeType === 'application/pdf';
        }
        if (accept === 'image') {
          return item.mimeType.startsWith('image/');
        }
        return true;
      })
      .map((item) => ({
        id: item.id,
        url: item.url,
        srcset: item.srcset,
        alt: item.altEn,
        originalName: item.originalName,
        mimeType: item.mimeType,
        missingAlt: item.mimeType.startsWith('image/') && !item.altEn,
      }));
  }, [accept, list.data?.pages]);

  const flat = flattenMediaPages(list.data?.pages);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>{t('pickerTitle')}</DialogTitle>
        <MediaUploader
          items={upload.items}
          accept={
            accept === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/avif'
          }
          labels={{
            drop: t('drop'),
            browse: t('browse'),
            cancel: t('cancel'),
            uploading: t('uploading'),
            done: t('done'),
            error: t('uploadError'),
            cancelled: t('cancelled'),
          }}
          onFiles={upload.uploadFiles}
          onCancel={upload.cancel}
        />
        <MediaLibrary
          items={items}
          selectedId={selected?.id}
          labels={{ missingAlt: t('missingAlt'), empty: t('empty'), pdf: t('pdf') }}
          onSelect={(item) => {
            const match = flat.find((row) => row.id === item.id);
            if (match) {
              setSelected(match);
            }
          }}
        />
        {list.hasNextPage ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void list.fetchNextPage()}
          >
            {t('loadMore')}
          </Button>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('dismiss')}
          </Button>
          <Button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onPick(selected);
                onOpenChange(false);
              }
            }}
          >
            {t('useFile')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
