'use client';

import type { PageKey } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { formatDateTime } from '@portfolio/ui/components/AuditRow/relative-time.util';
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@portfolio/ui/components/ui/sheet';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { RoleGate } from '@/modules/admin-core/components/RoleGate/RoleGate';

import { usePageVersions, useRestorePage } from '../../hooks/use-page-versions.hook';

export function VersionHistory({
  pageKey,
  onPreviewVersion,
}: {
  pageKey: PageKey;
  onPreviewVersion: (version: number | null) => void;
}) {
  const t = useTranslations('admin.pages.versions');
  const locale = useLocale();
  const versions = usePageVersions(pageKey);
  const restore = useRestorePage(pageKey);
  const [restoreVersion, setRestoreVersion] = useState<number | null>(null);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t('open')}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>{t('title')}</SheetTitle>
        {versions.isError ? <p className="text-destructive">{t('error')}</p> : null}
        <ul className="mt-4 flex flex-col gap-3">
          {(versions.data ?? []).map((row) => (
            <li key={row.version} className="border-border rounded-md border p-3">
              <p className="text-ui font-medium">{t('item', { version: row.version })}</p>
              <p className="text-ui-meta text-muted-foreground">
                {t('meta', {
                  date: formatDateTime(row.createdAt, locale),
                  author: row.authorName ?? t('unknownAuthor'),
                  note: row.note ?? t('noNote'),
                  count: row.blockCount,
                })}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onPreviewVersion(row.version)}
                >
                  {t('preview')}
                </Button>
                <RoleGate allow={['admin']}>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setRestoreVersion(row.version)}
                  >
                    {t('restore')}
                  </Button>
                </RoleGate>
              </div>
            </li>
          ))}
        </ul>
        <AlertDialog
          open={restoreVersion !== null}
          onOpenChange={(open) => !open && setRestoreVersion(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('restoreTitle')}</AlertDialogTitle>
              <AlertDialogDescription>{t('restoreHint')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (restoreVersion !== null) {
                    void restore.mutateAsync(restoreVersion);
                  }
                  setRestoreVersion(null);
                }}
              >
                {t('restore')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
