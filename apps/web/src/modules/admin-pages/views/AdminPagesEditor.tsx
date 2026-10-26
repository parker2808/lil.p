'use client';

import type { AdminBlock, BlockType, PageKey } from '@portfolio/contracts';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
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
import { Button } from '@portfolio/ui/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@portfolio/ui/components/ui/sheet';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { EditorShell } from '@/modules/admin-core/components/EditorShell/EditorShell';
import { useAutosave } from '@/modules/admin-core/hooks/use-autosave.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';

import { AddBlockDialog } from '../components/AddBlockDialog/AddBlockDialog';
import { BlockInspector, inspectorFieldErrors } from '../components/BlockInspector/BlockInspector';
import { BlockList } from '../components/BlockList/BlockList';
import { PagePreview } from '../components/PagePreview/PagePreview';
import { PageSettingsSheet } from '../components/PageSettingsSheet/PageSettingsSheet';
import { PublishBar } from '../components/PublishBar/PublishBar';
import { VersionHistory } from '../components/VersionHistory/VersionHistory';
import { useAdminPage } from '../hooks/use-admin-page.hook';
import { useBlockMutations } from '../hooks/use-block-mutations.hook';
import { publicPagePath } from '../utils/preview-frame.util';

export function AdminPagesEditor({ pageKey }: { pageKey: PageKey }) {
  const t = useTranslations('admin.pages');
  const editorT = useTranslations('admin.editor');
  const isAdmin = useIsAdmin();
  const readOnly = !isAdmin;
  const page = useAdminPage(pageKey);
  const mutations = useBlockMutations(pageKey, { reorderFailed: t('reorderFailed') });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [locale, setLocale] = useState<'en' | 'vi'>('en');
  const [draftProps, setDraftProps] = useState<Record<string, unknown> | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [invalidKeys, setInvalidKeys] = useState<string[]>([]);
  const [previewVersion, setPreviewVersion] = useState<number | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  const selected = page.data.blocks.find((block) => block.id === selectedId) ?? null;
  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const block of page.data.blocks) {
      next[block.type] = (next[block.type] ?? 0) + 1;
    }
    return next;
  }, [page.data.blocks]);

  function bumpPreview() {
    setRefreshToken((value) => value + 1);
  }

  const propsValue = JSON.stringify(draftProps ?? selected?.props ?? {});
  const baseline = selected ? JSON.stringify(selected.props) : null;
  const autosave = useAutosave({
    value: propsValue,
    baseline,
    updatedAt: selected?.updatedAt ?? null,
    enabled: Boolean(selected) && isAdmin,
    storageKey: `admin-block-${pageKey}-${selected?.id ?? 'none'}`,
    save: async ({ value, updatedAt }) => {
      if (!selected) {
        return { updatedAt: updatedAt ?? '' };
      }
      try {
        const next = await mutations.update.mutateAsync({
          id: selected.id,
          body: {
            props: JSON.parse(value) as Record<string, unknown>,
            updatedAt: updatedAt ?? undefined,
          },
        });
        setFieldErrors({});
        bumpPreview();
        return { updatedAt: next.updatedAt };
      } catch (error) {
        setFieldErrors(inspectorFieldErrors(error));
        throw error;
      }
    },
  });

  function move(block: AdminBlock, direction: -1 | 1) {
    const ids = page.data.blocks.map((item) => item.id);
    const index = ids.indexOf(block.id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) {
      return;
    }
    const current = ids[index];
    const swap = ids[next];
    if (current === undefined || swap === undefined) {
      return;
    }
    ids[index] = swap;
    ids[next] = current;
    const first = page.data.blocks[0];
    if (first && BLOCK_REGISTRY[first.type as BlockType]?.role === 'h1' && ids[0] !== first.id) {
      return;
    }
    mutations.reorder.mutate(ids, { onSuccess: bumpPreview });
  }

  const publicHref = publicPagePath(pageKey, 'en');
  const preview = (
    <PagePreview
      pageKey={pageKey}
      locale={locale}
      version={previewVersion ?? undefined}
      frameRef={frameRef}
      refreshToken={refreshToken}
      focusId={selectedId}
    />
  );

  return (
    <>
      <EditorShell
        title={
          <span className="flex items-center gap-2">
            {t(`names.${pageKey}`)}
            <Link
              href={publicHref}
              className="text-ui text-primary underline-offset-4 hover:underline"
            >
              {t('openPage')}
            </Link>
          </span>
        }
        saveStatus={autosave.status === 'dirty' ? 'idle' : autosave.status}
        savedText={autosave.savedAt ? editorT('saved', { seconds: 1 }) : undefined}
        onLoadLatest={() => {
          void page.refetch();
        }}
        onOverwrite={() => {
          void autosave.overwrite();
        }}
        publish={
          <div className="flex flex-wrap items-center gap-2">
            <PublishBar pageKey={pageKey} page={page.data} onInvalid={setInvalidKeys} />
            <VersionHistory pageKey={pageKey} onPreviewVersion={setPreviewVersion} />
            <PageSettingsSheet
              page={page.data}
              readOnly={readOnly}
              onSave={async (body) => {
                const next = await mutations.savePage.mutateAsync(body);
                bumpPreview();
                return next;
              }}
            />
            <AddBlockDialog
              pageKey={pageKey}
              counts={counts}
              readOnly={readOnly}
              onAdd={(type) =>
                mutations.add.mutate(
                  { type, afterId: selectedId ?? undefined },
                  { onSuccess: bumpPreview },
                )
              }
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" size="sm" variant="outline" className="2xl:hidden">
                  {t('preview.open')}
                </Button>
              </SheetTrigger>
              <SheetContent className="max-w-2xl">
                <SheetTitle>{t('preview.title')}</SheetTitle>
                {preview}
              </SheetContent>
            </Sheet>
          </div>
        }
        preview={preview}
        properties={
          selected ? (
            <BlockInspector
              key={selected.id}
              block={selected}
              readOnly={readOnly}
              fieldErrors={fieldErrors}
              onUpdate={async (body) => {
                const next = await mutations.update.mutateAsync({ id: selected.id, body });
                bumpPreview();
                return next;
              }}
              onPropsChange={setDraftProps}
            />
          ) : (
            <p className="text-ui-meta text-muted-foreground">{t('selectBlock')}</p>
          )
        }
        locale={locale}
        onLocaleChange={setLocale}
        completeness={{
          en: Boolean(page.data.seoTitleEn),
          vi: Boolean(page.data.seoTitleVi),
        }}
        labels={{
          readOnly: editorT('readOnly'),
          properties: t('inspector'),
          saving: editorT('saving'),
          saved: editorT('saved', { seconds: 1 }),
          offline: editorT('offline'),
          conflict: editorT('conflict'),
          loadLatest: editorT('loadLatest'),
          overwrite: editorT('overwrite'),
          localeEn: editorT('localeEn'),
          localeVi: editorT('localeVi'),
        }}
      >
        <BlockList
          blocks={page.data.blocks}
          selectedId={selectedId}
          invalidKeys={invalidKeys}
          readOnly={readOnly}
          labels={{
            handle: t('dragHandle'),
            instructions: t('dragInstructions'),
            pickedUp: t('pickedUp', { id: '{id}' }),
            movedOver: t('movedOver', { id: '{id}', over: '{over}' }),
            dropped: t('dropped', { id: '{id}', over: '{over}' }),
            cancelled: t('cancelled', { id: '{id}' }),
            menu: t('rowMenu'),
            moveUp: t('moveUp'),
            moveDown: t('moveDown'),
            duplicate: t('duplicate'),
            delete: t('delete'),
            visible: t('visible'),
            unknown: t('unknown'),
          }}
          onSelect={setSelectedId}
          onToggle={(block, isVisible) =>
            mutations.toggle.mutate(
              { id: block.id, isVisible, updatedAt: block.updatedAt },
              { onSuccess: bumpPreview },
            )
          }
          onMove={move}
          onDuplicate={(id) => mutations.duplicate.mutate(id, { onSuccess: bumpPreview })}
          onDelete={setDeleteId}
          onReorder={(ids) => mutations.reorder.mutate(ids, { onSuccess: bumpPreview })}
        />
      </EditorShell>
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId !== null) {
                  mutations.remove.mutate(deleteId, { onSuccess: bumpPreview });
                  if (selectedId === deleteId) {
                    setSelectedId(null);
                  }
                }
                setDeleteId(null);
              }}
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
