'use client';

import { type AdminMedia, qk } from '@portfolio/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { MediaUploadItem } from '@portfolio/ui/components/MediaUploader/MediaUploader';

import { uploadMedia } from '../services/media-upload.service';

export function useMediaUpload(onUploaded?: (media: AdminMedia) => void) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.media');
  const [items, setItems] = useState<MediaUploadItem[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const patch = useCallback((id: string, next: Partial<MediaUploadItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...next } : item)));
  }, []);

  const uploadFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`;
        const controller = new AbortController();
        controllers.current.set(id, controller);
        setItems((current) => [
          ...current,
          { id, name: file.name, progress: 0, status: 'uploading' },
        ]);
        void uploadMedia(file, {
          signal: controller.signal,
          onProgress: (progress) => patch(id, { progress }),
        })
          .then((media) => {
            patch(id, { progress: 100, status: 'done' });
            void queryClient.invalidateQueries({ queryKey: qk.admin.media.all });
            void queryClient.invalidateQueries({ queryKey: qk.admin.health });
            onUploaded?.(media);
          })
          .catch((error: unknown) => {
            const cancelled = error instanceof Error && error.name === 'AbortError';
            patch(id, {
              status: cancelled ? 'cancelled' : 'error',
              error: cancelled ? undefined : t('uploadError'),
            });
            if (!cancelled) {
              toast.error(t('uploadError'));
            }
          })
          .finally(() => {
            controllers.current.delete(id);
          });
      }
    },
    [onUploaded, patch, queryClient, t],
  );

  const cancel = useCallback(
    (id: string) => {
      controllers.current.get(id)?.abort();
      patch(id, { status: 'cancelled' });
    },
    [patch],
  );

  return { items, uploadFiles, cancel };
}
