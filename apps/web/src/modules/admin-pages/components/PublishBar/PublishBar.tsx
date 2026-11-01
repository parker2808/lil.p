'use client';

import type { AdminPage, PageKey } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { Input } from '@portfolio/ui/components/ui/input';
import { Label } from '@portfolio/ui/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@portfolio/ui/components/ui/alert-dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { RoleGate } from '@/modules/admin-core/components/RoleGate/RoleGate';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { usePublishAction } from '@/modules/admin-core/stores/admin-ui.store';
import { ApiError } from '@/modules/core/utils/api-error.util';

import { useDiscardPage, usePublishPage } from '../../hooks/use-page-versions.hook';

export function PublishBar({
  pageKey,
  page,
  onInvalid,
}: {
  pageKey: PageKey;
  page: AdminPage;
  onInvalid: (keys: string[]) => void;
}) {
  const t = useTranslations('admin.pages.publish');
  const isAdmin = useIsAdmin();
  const publish = usePublishPage(pageKey);
  const discard = useDiscardPage(pageKey);
  const [note, setNote] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPublish() {
    setError(null);
    try {
      await publish.mutateAsync(note.trim() || undefined);
      setNote('');
      onInvalid([]);
    } catch (caught) {
      if (caught instanceof ApiError) {
        const keys = Object.keys(caught.fieldErrors ?? {})
          .map((path) => path.replace(/^block:/, '').split('.')[0])
          .filter((key): key is string => Boolean(key));
        onInvalid(keys);
        setError(caught.code === 'INVALID_BLOCKS' ? t('invalidBlocks') : caught.message);
        return;
      }
      setError(t('failed'));
    }
  }

  usePublishAction(() => void onPublish(), isAdmin && !publish.isPending);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {page.hasUnpublishedChanges ? (
        <Badge variant="warning">{t('unpublished')}</Badge>
      ) : page.publishedVersion ? (
        <Badge variant="outline">{t('published', { version: page.publishedVersion })}</Badge>
      ) : (
        <Badge variant="warning">{t('never')}</Badge>
      )}
      <RoleGate allow={['admin']}>
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="page-publish-note" className="sr-only">
            {t('note')}
          </Label>
          <Input
            id="page-publish-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('note')}
            maxLength={200}
            className="w-40"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => void onPublish()}
            disabled={publish.isPending}
          >
            {t('publish')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!page.publishedVersion || discard.isPending}
            onClick={() => setConfirmDiscard(true)}
          >
            {t('discard')}
          </Button>
        </div>
      </RoleGate>
      {error ? <p className="text-ui-meta text-destructive">{error}</p> : null}
      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('discardTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('discardHint')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void discard.mutateAsync();
                setConfirmDiscard(false);
              }}
            >
              {t('discard')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
