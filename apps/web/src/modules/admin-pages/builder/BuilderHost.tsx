'use client';

import {
  createTreeHistory,
  DraftAutosave,
  redoTreeHistory,
  undoTreeHistory,
  type AutosaveState,
  type TreeDocument,
  type TreeHistory,
  type TreeOperation,
} from '@parker2808/cms-core/tree';
import { Button } from '@portfolio/ui/components/ui/button';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useMe } from '@/modules/admin-core/hooks/use-me.hook';

import { BuilderShell } from './BuilderShell';
import {
  activateBuilderDraft,
  readBuilderDraft,
  readActiveBuilderDraft,
  saveBuilderDraft,
} from './autosave/transport';
import { clearRecovery, readRecovery, recoveryKey, writeRecovery } from './autosave/recovery';
import type { BuilderCommand } from './canvas/commands';
import type { CompositionResult } from './canvas/model';
import { commitComposition, commitProperty } from './history/adapter';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { builderRegistry } from './properties/registry';
import styles from './builder.module.css';

const empty: TreeDocument = {
  schemaVersion: 1,
  root: { id: 'page', type: 'page', responsive: { base: {} }, sections: [] },
};

const labels = {
  en: {
    undo: 'Undo',
    redo: 'Redo',
    local: 'Local study · not saved',
    loading: 'Loading draft',
    legacy: 'Local study · activate to save',
    legacyConflict: 'Server draft was restored · your edits are kept locally',
    activate: 'Activate tree draft',
    saving: 'Saving draft',
    saved: 'Draft saved',
    dirty: 'Unsaved changes',
    offline: 'Offline · your edits are kept locally',
    conflict: 'Conflict · your edits are kept locally',
    review: 'Save uncertain · your edits are kept locally',
    retry: 'Retry',
    reviewChanges: 'Review changes',
    keepLocal: 'Keep local edits',
    reload: 'Discard local edits and reload server draft',
    export: 'Export local draft',
    restore: 'Restore local edits',
    dismiss: 'Dismiss recovery',
    recoveryFailed: 'Local recovery is unavailable. Stay on this page or export your edits.',
    noAccess: 'Draft unavailable · editing locally only',
  },
  vi: {
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    local: 'Bản mẫu cục bộ · chưa lưu',
    loading: 'Đang tải bản nháp',
    legacy: 'Bản mẫu cục bộ · kích hoạt để lưu',
    legacyConflict: 'Bản nháp máy chủ đã được khôi phục · thay đổi của bạn vẫn được giữ cục bộ',
    activate: 'Kích hoạt bản nháp cây',
    saving: 'Đang lưu bản nháp',
    saved: 'Đã lưu bản nháp',
    dirty: 'Có thay đổi chưa lưu',
    offline: 'Ngoại tuyến · thay đổi của bạn được giữ cục bộ',
    conflict: 'Xung đột · thay đổi của bạn được giữ cục bộ',
    review: 'Chưa rõ trạng thái lưu · thay đổi của bạn được giữ cục bộ',
    retry: 'Thử lại',
    reviewChanges: 'Xem thay đổi',
    keepLocal: 'Giữ thay đổi cục bộ',
    reload: 'Bỏ thay đổi cục bộ và tải lại bản nháp máy chủ',
    export: 'Xuất bản nháp cục bộ',
    restore: 'Khôi phục thay đổi cục bộ',
    dismiss: 'Bỏ qua bản khôi phục',
    recoveryFailed: 'Không thể khôi phục cục bộ. Hãy ở lại trang hoặc xuất các thay đổi.',
    noAccess: 'Không thể tải bản nháp · chỉ chỉnh sửa cục bộ',
  },
} as const;

function editableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      !!target.closest('input, textarea, select, [contenteditable="true"]'))
  );
}
function subscribeOnline(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export function BuilderHost({ pageKey }: { pageKey: string }) {
  const locale = useLocale() === 'vi' ? 'vi' : 'en';
  const text = labels[locale];
  const { id: userId } = useMe();
  const key = recoveryKey(userId, pageKey);
  const history = useRef<TreeHistory>(createTreeHistory(empty, 'page'));
  const [state, setState] = useState({ document: empty, selectedId: 'page' });
  const [historySize, setHistorySize] = useState({ past: 0, future: 0 });
  const [mode, setMode] = useState<'local' | 'loading' | 'legacy' | 'active' | 'unavailable'>(
    pageKey === 'home' ? 'local' : 'loading',
  );
  const [status, setStatus] = useState<AutosaveState['status']>('saved');
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  const [recovery, setRecovery] = useState<TreeDocument | undefined>();
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const autosave = useRef<DraftAutosave | null>(null);

  const present = useCallback((next: TreeHistory) => {
    history.current = next;
    setState({ document: next.document, selectedId: next.selectedId ?? 'page' });
    setHistorySize({ past: next.past.length, future: next.future.length });
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (pageKey === 'home') return;
    void readBuilderDraft(pageKey)
      .then((draft) => {
        if (cancelled) return;
        if (draft.mode === 'tree' && draft.tree) {
          present(createTreeHistory(draft.tree, 'page'));
          autosave.current = new DraftAutosave(
            { tree: draft.tree, revision: draft.revision },
            {
              save: ({ tree, expectedRevision }) =>
                saveBuilderDraft(pageKey, tree, expectedRevision),
              read: () => readActiveBuilderDraft(pageKey),
            },
            {
              schedule: (callback, delay) => setTimeout(callback, delay),
              cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
            },
            builderRegistry,
          );
          setMode('active');
        } else setMode('legacy');
        const stored = readRecovery(key);
        if (stored && JSON.stringify(stored) !== JSON.stringify(draft.tree)) setRecovery(stored);
      })
      .catch(() => {
        if (!cancelled) setMode('unavailable');
      });
    return () => {
      cancelled = true;
      autosave.current?.dispose();
      autosave.current = null;
    };
  }, [key, pageKey, present]);

  useEffect(() => {
    if (mode !== 'active') return;
    const interval = window.setInterval(() => {
      const snapshot = autosave.current?.state;
      if (!snapshot) return;
      setStatus(snapshot.status);
      if (
        snapshot.status === 'saved' &&
        JSON.stringify(snapshot.local) === JSON.stringify(history.current.document)
      ) {
        clearRecovery(key);
        setRecoveryFailed(false);
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [key, mode]);

  const changed = useCallback(
    (next: TreeHistory) => {
      present(next);
      if (pageKey !== 'home') {
        setRecoveryFailed(!writeRecovery(key, next.document));
        autosave.current?.edit(next.document);
        setStatus(autosave.current?.state.status ?? 'dirty');
      }
    },
    [key, pageKey, present],
  );

  useEffect(() => {
    if (!recoveryFailed || status === 'saved') return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [recoveryFailed, status]);

  const onDispatch = useCallback(
    (command: BuilderCommand): CompositionResult => {
      const update = commitComposition(history.current, command);
      if (update.result.ok) {
        if (command.type === 'select') present(update.history);
        else if (update.history !== history.current) changed(update.history);
      }
      return update.result;
    },
    [changed, present],
  );

  const onEdit = useCallback(
    (operation: TreeOperation, typing?: boolean) => {
      const update = commitProperty(history.current, operation, typing);
      if (!update.error && update.history !== history.current) changed(update.history);
      return update.error;
    },
    [changed],
  );

  const travel = useCallback(
    (direction: 'undo' | 'redo') => {
      const next =
        direction === 'undo' ? undoTreeHistory(history.current) : redoTreeHistory(history.current);
      if (next !== history.current) changed(next);
    },
    [changed],
  );

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || editableTarget(event.target)) return;
      const keyName = event.key.toLowerCase();
      if (keyName === 'z' || keyName === 'y') {
        event.preventDefault();
        travel(keyName === 'y' || event.shiftKey ? 'redo' : 'undo');
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [travel]);

  async function activate() {
    try {
      const remote = await readBuilderDraft(pageKey);
      if (remote.mode !== 'legacy') {
        setMode('unavailable');
        return;
      }
      const draft = await activateBuilderDraft(pageKey, history.current.document, remote.revision);
      autosave.current = new DraftAutosave(
        draft,
        {
          save: ({ tree, expectedRevision }) => saveBuilderDraft(pageKey, tree, expectedRevision),
          read: () => readActiveBuilderDraft(pageKey),
        },
        {
          schedule: (callback, delay) => setTimeout(callback, delay),
          cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
        },
        builderRegistry,
      );
      clearRecovery(key);
      setStatus('saved');
      setMode('active');
    } catch {
      setMode('unavailable');
    }
  }

  async function review() {
    setReviewOpen(true);
    const remote = await autosave.current?.review();
    setRemoteAvailable(Boolean(remote?.tree));
    setStatus(autosave.current?.state.status ?? 'review');
  }

  async function retry() {
    const controller = autosave.current;
    if (!controller) return;
    const remote = await controller.review();
    setRemoteAvailable(Boolean(remote?.tree));
    if (remote && controller.resolveReviewed('acknowledge')) {
      controller.edit(history.current.document);
    }
    setStatus(controller.state.status);
    setReviewOpen(['conflict', 'review', 'legacy'].includes(controller.state.status));
  }

  function exportLocal() {
    const blob = new Blob([JSON.stringify(history.current.document, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `builder-${pageKey}-local.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function reload() {
    const controller = autosave.current;
    if (
      !controller?.state.remote?.tree ||
      !controller.resolveReviewed('reload', { discardLocalEdits: true })
    )
      return;
    present(createTreeHistory(controller.state.local, 'page'));
    clearRecovery(key);
    setStatus('saved');
    setReviewOpen(false);
    setRemoteAvailable(false);
  }

  const shownStatus =
    mode === 'local'
      ? text.local
      : mode === 'loading'
        ? text.loading
        : mode === 'legacy'
          ? text.legacy
          : mode === 'unavailable'
            ? text.noAccess
            : !online && status !== 'saved'
              ? text.offline
              : text[
                  status === 'invalid' ? 'review' : status === 'legacy' ? 'legacyConflict' : status
                ];

  if (mode === 'loading')
    return (
      <div className={styles.loading} role="status">
        {text.loading}
      </div>
    );

  return (
    <div className={styles.host}>
      <BuilderShell
        pageKey={pageKey}
        state={state}
        onDispatch={onDispatch}
        status={shownStatus}
        historyControls={
          <div className={styles.hostActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => travel('undo')}
              disabled={!historySize.past}
              aria-label={text.undo}
            >
              {text.undo}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => travel('redo')}
              disabled={!historySize.future}
              aria-label={text.redo}
            >
              {text.redo}
            </Button>
            {mode === 'legacy' && (
              <Button type="button" onClick={() => void activate()}>
                {text.activate}
              </Button>
            )}
            {mode === 'active' && ['review', 'conflict', 'invalid', 'legacy'].includes(status) && (
              <>
                <Button type="button" variant="outline" onClick={() => void retry()}>
                  {text.retry}
                </Button>
                <Button type="button" variant="outline" onClick={() => void review()}>
                  {text.reviewChanges}
                </Button>
              </>
            )}
          </div>
        }
        renderProperties={() => <PropertiesPanel state={state} locale={locale} onEdit={onEdit} />}
      />
      {recovery && (
        <div role="region" aria-label={text.restore} className={styles.recovery}>
          <p>{text.dirty}</p>
          <Button
            type="button"
            onClick={() => {
              changed(createTreeHistory(recovery, 'page'));
              setRecovery(undefined);
            }}
          >
            {text.restore}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRecovery(undefined);
              clearRecovery(key);
            }}
          >
            {text.dismiss}
          </Button>
        </div>
      )}
      {recoveryFailed && status !== 'saved' && (
        <div role="alert" className={styles.recovery}>
          <p>{text.recoveryFailed}</p>
          <Button type="button" onClick={exportLocal}>
            {text.export}
          </Button>
        </div>
      )}
      {reviewOpen && (
        <div role="region" aria-label={text.reviewChanges} className={styles.recovery}>
          <p>{shownStatus}</p>
          <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>
            {text.keepLocal}
          </Button>
          <Button type="button" onClick={exportLocal}>
            {text.export}
          </Button>
          <Button type="button" variant="outline" disabled={!remoteAvailable} onClick={reload}>
            {text.reload}
          </Button>
          <Button type="button" variant="outline" onClick={() => void retry()}>
            {text.retry}
          </Button>
        </div>
      )}
    </div>
  );
}
