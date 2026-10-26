'use client';

import type { AdminMedia } from '@portfolio/contracts';
import { MediaLibrary } from '@portfolio/ui/components/MediaLibrary/MediaLibrary';
import { MediaUploader } from '@portfolio/ui/components/MediaUploader/MediaUploader';
import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@portfolio/ui/components/ui/sheet';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';

import {
  flattenMediaPages,
  useAdminMediaList,
  useAdminMediaMutations,
} from '../hooks/use-admin-media.hook';
import { useMediaUpload } from '../hooks/use-media-upload.hook';

export function AdminMediaIndex() {
  const t = useTranslations('admin.media');
  const canWrite = useIsAdmin();
  const list = useAdminMediaList();
  const upload = useMediaUpload();
  const mutations = useAdminMediaMutations();
  const [editing, setEditing] = useState<AdminMedia | null>(null);
  const [altEn, setAltEn] = useState('');
  const [altVi, setAltVi] = useState('');

  const items = flattenMediaPages(list.data?.pages);
  const tiles = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        url: item.url,
        srcset: item.srcset,
        alt: item.altEn,
        originalName: item.originalName,
        mimeType: item.mimeType,
        missingAlt: item.mimeType.startsWith('image/') && !item.altEn,
      })),
    [items],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
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
      </div>
      {canWrite ? (
        <MediaUploader
          items={upload.items}
          accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
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
      ) : null}
      {list.isError ? <p className="text-destructive">{t('loadError')}</p> : null}
      <MediaLibrary
        items={tiles}
        labels={{ missingAlt: t('missingAlt'), empty: t('empty'), pdf: t('pdf') }}
        onSelect={(item) => {
          const match = items.find((row) => row.id === item.id);
          if (match) {
            setEditing(match);
            setAltEn(match.altEn);
            setAltVi(match.altVi);
          }
        }}
      />
      <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent>
          <SheetTitle>{editing?.originalName}</SheetTitle>
          {editing ? (
            <div className="flex flex-col gap-3 px-4">
              <Field>
                <FieldLabel htmlFor="altEn">{t('altEn')}</FieldLabel>
                <Input
                  id="altEn"
                  value={altEn}
                  disabled={!canWrite}
                  onChange={(event) => setAltEn(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="altVi">{t('altVi')}</FieldLabel>
                <Input
                  id="altVi"
                  value={altVi}
                  disabled={!canWrite}
                  onChange={(event) => setAltVi(event.target.value)}
                />
              </Field>
              {canWrite ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      mutations.update.mutate(
                        { id: editing.id, body: { altEn, altVi } },
                        { onSuccess: () => setEditing(null) },
                      );
                    }}
                  >
                    {t('saveAlt')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      mutations.remove.mutate(editing.id, { onSuccess: () => setEditing(null) });
                    }}
                  >
                    {t('delete')}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
