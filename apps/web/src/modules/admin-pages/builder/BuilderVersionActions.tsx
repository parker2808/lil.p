'use client';

import type { AdminPageVersionListItem, PageKey } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
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
import { useEffect, useState } from 'react';

import { listAdminPageVersions } from '../services/admin-pages.service';

const copy = {
  en: {
    publish: 'Publish',
    history: 'Version history',
    loading: 'Loading versions…',
    empty: 'No published versions yet',
    failed: 'Could not load versions',
    retry: 'Retry',
    version: 'Version',
    restore: 'Restore draft',
    confirm: 'Restore this version to the draft?',
    warning: 'This replaces the current server draft. It does not publish or delete any version.',
    cancel: 'Cancel',
    pending: 'Working…',
  },
  vi: {
    publish: 'Xuất bản',
    history: 'Lịch sử phiên bản',
    loading: 'Đang tải phiên bản…',
    empty: 'Chưa có phiên bản đã xuất bản',
    failed: 'Không tải được phiên bản',
    retry: 'Thử lại',
    version: 'Phiên bản',
    restore: 'Khôi phục bản nháp',
    confirm: 'Khôi phục phiên bản này vào bản nháp?',
    warning: 'Thao tác này thay thế bản nháp trên máy chủ, không xuất bản hoặc xóa phiên bản.',
    cancel: 'Hủy',
    pending: 'Đang xử lý…',
  },
} as const;

export function BuilderVersionActions({
  pageKey,
  locale,
  canPublish,
  canRestore,
  isAdmin,
  pending,
  onPublish,
  onRestore,
}: {
  pageKey: string;
  locale: 'en' | 'vi';
  canPublish: boolean;
  canRestore: boolean;
  isAdmin: boolean;
  pending: boolean;
  onPublish: () => Promise<boolean>;
  onRestore: (version: number) => Promise<boolean>;
}) {
  const text = copy[locale];
  const [open, setOpen] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState<number | null>(null);
  const [versions, setVersions] = useState<AdminPageVersionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listAdminPageVersions(pageKey as PageKey)
      .then((rows) => {
        if (!cancelled) {
          setVersions(rows);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, pageKey, refresh]);

  return (
    <>
      {isAdmin && (
        <Button
          type="button"
          disabled={!canPublish || pending}
          onClick={() => {
            void onPublish().then((success) => {
              if (success) setRefresh((value) => value + 1);
            });
          }}
        >
          {pending ? text.pending : text.publish}
        </Button>
      )}
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setLoading(true);
        }}
      >
        <SheetTrigger asChild>
          <Button type="button" variant="outline">
            {text.history}
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetTitle>{text.history}</SheetTitle>
          {loading && <p role="status">{text.loading}</p>}
          {error && !loading && (
            <div role="alert">
              {text.failed}{' '}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLoading(true);
                  setRefresh((value) => value + 1);
                }}
              >
                {text.retry}
              </Button>
            </div>
          )}
          {!loading && !error && !versions.length && <p>{text.empty}</p>}
          {!loading && !error && (
            <ul className="mt-4 flex flex-col gap-3">
              {versions.map((row) => (
                <li key={row.version} className="border-border rounded-md border p-3">
                  <strong>
                    {text.version} {row.version}
                  </strong>
                  <p className="text-muted-foreground text-sm">
                    {row.note ?? new Date(row.createdAt).toLocaleString(locale)}
                  </p>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      disabled={!canRestore || pending}
                      onClick={() => setRestoreVersion(row.version)}
                    >
                      {text.restore} {row.version}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={restoreVersion !== null}
        onOpenChange={(next) => {
          if (!next && !pending) setRestoreVersion(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.confirm}</AlertDialogTitle>
            <AlertDialogDescription>{text.warning}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{text.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canRestore || pending}
              onClick={(event) => {
                event.preventDefault();
                if (restoreVersion === null) return;
                void onRestore(restoreVersion).then((success) => {
                  if (success) {
                    setRestoreVersion(null);
                    setOpen(false);
                  }
                });
              }}
            >
              {text.restore}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
