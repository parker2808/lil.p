'use client';

import type { AdminBlock, BlockType, PageKey } from '@portfolio/contracts';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
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
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { EditorShell } from '@/modules/admin-core/components/EditorShell/EditorShell';
import { useAutosave } from '@/modules/admin-core/hooks/use-autosave.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';

import { AddBlockDialog } from '../components/AddBlockDialog/AddBlockDialog';
import { BlockInspector, inspectorFieldErrors } from '../components/BlockInspector/BlockInspector';
import { BlockList } from '../components/BlockList/BlockList';
import { PageSettingsSheet } from '../components/PageSettingsSheet/PageSettingsSheet';
import { useAdminPage } from '../hooks/use-admin-page.hook';
import { useBlockMutations } from '../hooks/use-block-mutations.hook';

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

  const selected = page.data.blocks.find((block) => block.id === selectedId) ?? null;
  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const block of page.data.blocks) {
      next[block.type] = (next[block.type] ?? 0) + 1;
    }
    return next;
  }, [page.data.blocks]);

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
    mutations.reorder.mutate(ids);
  }

  const publicHref = pageKey === 'home' ? '/en' : `/en/${pageKey}`;

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
          <div className="flex items-center gap-2">
            <Badge variant="warning">{t('draft')}</Badge>
            <PageSettingsSheet
              page={page.data}
              readOnly={readOnly}
              onSave={mutations.savePage.mutateAsync}
            />
            <AddBlockDialog
              pageKey={pageKey}
              counts={counts}
              readOnly={readOnly}
              onAdd={(type) => mutations.add.mutate({ type, afterId: selectedId ?? undefined })}
            />
          </div>
        }
        properties={
          selected ? (
            <BlockInspector
              key={selected.id}
              block={selected}
              readOnly={readOnly}
              fieldErrors={fieldErrors}
              onUpdate={(body) => mutations.update.mutateAsync({ id: selected.id, body })}
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
            mutations.toggle.mutate({ id: block.id, isVisible, updatedAt: block.updatedAt })
          }
          onMove={move}
          onDuplicate={(id) => mutations.duplicate.mutate(id)}
          onDelete={setDeleteId}
          onReorder={(ids) => mutations.reorder.mutate(ids)}
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
                  mutations.remove.mutate(deleteId);
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
